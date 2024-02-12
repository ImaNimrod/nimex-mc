import { Client, IntentsBitField } from "discord.js";
import { createBot, Bot } from "mineflayer";
import { Vec3 } from "vec3";

import Config from "./config";
import loadCommands from "./handlers/commandHandler";
import loadEvents from "./handlers/eventHandler";
import OrderModel from "./models/order";
import { getCollections } from "./mongo";

export default class Deliverer extends Client {
    commands = loadCommands(this);
    events = loadEvents(this);

    initialized: boolean = false;
    stashChests: Vec3[] = [];
    currentOrder: OrderModel | null = null;
    servicingOrder: boolean = false;
    orderReady: boolean = false;

    bot: Bot | null = null;

    constructor(readonly config: Config) {
        super({
            intents: [
                IntentsBitField.Flags.Guilds,
                IntentsBitField.Flags.GuildMembers,
                IntentsBitField.Flags.GuildMessages,
                IntentsBitField.Flags.MessageContent,
            ],
        });

        this.login(config.discordToken);
    }

    async acquireKit(kitId: string): Promise<boolean> {
        for (const chest of this.stashChests) {
            const openedChest = await this.bot!.openContainer(await this.bot!.world.getBlock(chest));

            for (const item of openedChest.containerItems()) {
                if (!item.name.includes("shulker_box") || !item.customName) continue;

                if (item.customName.includes(kitId)) {
                    await openedChest.withdraw(item.type, null, null);
                    openedChest.close();
                    return true;
                }
            }
 
            openedChest.close();
        }

        return false;
    }

    async dropInventory() {
        for (const item of this.bot!.inventory.slots) {
            if (!item) continue;
            await this.bot!.tossStack(item);
        }
    }

    notifyUser(guildId: string, username: string, message: string) {
        const guild = this.guilds.cache.get(guildId);
        if (!guild) return;

        const user = guild.members.cache.find(m => m.user.username === username);
        if (!user) return;

        user.send(message);
    }

    reset() {
        this.currentOrder = null;
        this.servicingOrder = false;
        this.orderReady = false;
    }

    start() {
        const bot: Bot = createBot({
            username: this.config.minecraftUsername,
            skipValidation: true,
            version: "1.19.4",
            host: "6b6t.org",
            checkTimeoutInterval: 9999999,
        });

        this.bot = bot;

        bot.once("spawn", async () => {
            bot.chat("/register " + this.config.minecraftPassword);
            await bot.waitForTicks(2);
            bot.chat("/login " + this.config.minecraftPassword);

            while (bot.game?.difficulty == "peaceful") {
                bot.setControlState("forward", true);
                await bot.waitForTicks(20);
                bot.setControlState("forward", false);
            }

            bot.addChatPattern("tpaDenied", /.*was denied!$/);
            bot.addChatPattern("tpaFail", /Player not found!/);
            bot.addChatPattern("tpaSent", /Request sent to.*/);
            bot.addChatPattern("tpaSuccess", /Teleported to.*/);
            bot.addChatPattern("tpaTimeout", /Your teleport request to.*/);
        });

        bot.on("spawn", async () => {
            if (bot.game?.difficulty == "peaceful") return;
            if (this.initialized) return;

            await bot.waitForTicks(20);

            this.stashChests = bot.findBlocks({
                matching: bot.registry.blocksByName["trapped_chest"].id,
                count: 20,
            });

            if (!this.stashChests.length) {
                console.error(`ERROR: mc bot unable to find stash chests`);
                this.stop()
                return;
            }

            console.log(`mc bot (${this.config.minecraftUsername}) initialized`);
            this.initialized = true;
        });

        bot.on("death", async () => {
            if (this.currentOrder && this.servicingOrder) {
                await getCollections().orders.updateOne(
                    { discordUsername: this.currentOrder.discordUsername, createdAt: this.currentOrder.createdAt },
                    { $set: { delivered: true, deliveredAt: new Date() }},
                );

                this.reset();
            }
        });

        bot.on("error", (err) => {
            console.error("ERROR: " + err);
            bot.end("error");
        });

        bot.on("kicked", () => {
            bot.end("kick");
        });

        bot.on("end", (reason) => {
            bot.removeAllListeners();

            this.bot = null;
            this.initialized = false;

            if (reason == "kick") {
                console.log("mc bot kicked... rejoining server in 5s");
                setTimeout(this.start, 5000);
            } else {
                console.error("ERROR: mc bot ended unexpectedly... restarting in 5s");
                setTimeout(this.start, 5000);
            }
        });

        // @ts-ignore
        bot.on("chat:tpaDenied", async () => {
            if (this.currentOrder && this.servicingOrder) {
                bot.chat(`/msg ${this.currentOrder.minecraftUsername} You canceled your order last minute. Be better.`);
                await getCollections().orders.deleteOne({ discordUsername: this.currentOrder.discordUsername, createdAt: this.currentOrder.createdAt });
                await this.dropInventory();
                this.reset();
            }
        });

        // @ts-ignore
        bot.on("chat:tpaFail", async () => {
            if (this.currentOrder && this.servicingOrder) {
                await this.dropInventory();
                this.reset();
            }
        });

        // @ts-ignore
        bot.on("chat:tpaSent", () => {
            if (this.currentOrder && this.servicingOrder) {
                this.notifyUser(
                    this.currentOrder.discordGuildId,
                    this.currentOrder.discordUsername,
                    `Your order is out for delivery, please **accept the tpa request** from **${this.config.minecraftUsername}**.`
                );

                bot.chat(`/msg ${this.currentOrder.minecraftUsername} Your order is out for delivery. Please accept the tpa request.`);
                this.orderReady = false;
            }
        });

        // @ts-ignore
        bot.on("chat:tpaSuccess", async () => {
            if (this.currentOrder && this.servicingOrder) {
                this.notifyUser(
                    this.currentOrder.discordGuildId,
                    this.currentOrder.discordUsername,
                    "Your order has been completed. Thank you for choosing the **Nimrod Express**!"
                );

                console.log("order delivered");

                bot.chat(`/msg ${this.currentOrder.minecraftUsername} Please kill me to receive your order.`);
            }
        });

        // @ts-ignore
        bot.on("chat:tpaTimeout", async () => {
            if (this.currentOrder && this.servicingOrder) {
                bot.chat(`/msg ${this.currentOrder.minecraftUsername} Your delivery has timed out due to you not accepting the tpa request. Be better.`);

                await getCollections().orders.deleteOne({ discordUsername: this.currentOrder.discordUsername, createdAt: this.currentOrder.createdAt });
                await this.dropInventory();
                this.reset();
            }
        });

        bot.on("time", async () => {
            if (!this.initialized) return;

            if (this.currentOrder && this.orderReady) {
                bot.chat(`/tpa ${this.currentOrder.minecraftUsername}`);
                return;
            }

            if (this.servicingOrder) return;

            const nextOrder: OrderModel | null = await getCollections().orders.findOne({ delivered: false });
            if (this.currentOrder = nextOrder) {
                this.servicingOrder = true;

                console.log("began servicing new order");

                if (!bot.players[this.currentOrder.minecraftUsername]) {
                    console.log(`${this.currentOrder.minecraftUsername} is not online, discarding order`);

                    await getCollections().orders.deleteOne({ discordUsername: this.currentOrder.discordUsername, createdAt: this.currentOrder.createdAt });
                    this.reset();
                    return;
                }

                this.notifyUser(
                    this.currentOrder.discordGuildId,
                    this.currentOrder.discordUsername,
                    `Began processing your order for ${this.currentOrder.minecraftUsername}. You will be notified when your order is out for delivery.`
                );

                await bot.waitForTicks(20);
                for (const kitId of this.currentOrder.kitIds) {
                    if (!await this.acquireKit(kitId)) {
                        await getCollections().kits.updateOne(
                            { kitId: kitId },
                            { $set: { inStock: false }},
                        );

                        console.log(`WARNING: kit (id: ${kitId}) needs to be restocked`);

                        await getCollections().orders.deleteOne({ discordUsername: this.currentOrder.discordUsername, createdAt: this.currentOrder.createdAt });
                        await this.dropInventory();
                        this.reset();
                        return;
                    }
                }

                bot.chat(`/msg ${this.currentOrder.minecraftUsername} Your order is ready and will be delivered to you as soon as possible.`);
                this.orderReady = true;
            }
        });
    }

    stop() {
        console.log("stopping mc bot");
        this.bot!.end("stop");
        this.bot = null;
    }
}
