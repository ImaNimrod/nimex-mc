import { Client, IntentsBitField } from "discord.js";
import { createBot, Bot } from "mineflayer";
import { Vec3 } from "vec3";

import Config from "./config";
import loadCommands from "./handlers/commandHandler";
import loadEvents from "./handlers/eventHandler";
import Order, { getNextOrder, placeOrder } from "./models/order";
import { collections } from "./mongo";

export default class Deliverer extends Client {
    readonly config: Config;

    commands = loadCommands(this);
    events = loadEvents(this);

    initialized: boolean = false;
    stashChests: Vec3[] = [];
    currentOrder?: Order;
    servicingOrder: boolean = false;
    orderReady: boolean = false;
    tpaTimeoutCount: number = 0;

    bot?: Bot;

    constructor(config: Config) {
        super({
            intents: [
                IntentsBitField.Flags.Guilds,
                IntentsBitField.Flags.GuildMembers,
                IntentsBitField.Flags.GuildMessages,
                IntentsBitField.Flags.MessageContent,
            ],
        });

        this.config = config;
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

    async reset(dropItems: boolean) {
        if (dropItems) {
            for (const item of this.bot!.inventory.slots) {
                if (!item) continue;
                await this.bot!.tossStack(item);
            }
        }

        this.currentOrder = undefined;
        this.servicingOrder = false;
        this.orderReady = false;
        this.tpaTimeoutCount = 0;
    }

    public start() {
        console.log("starting mc bot...");

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

            while (bot?.game?.difficulty == "peaceful") {
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
            if (bot?.game?.difficulty == "peaceful") return;
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

            console.log(`mc bot ${this.config.minecraftUsername} initialized`);
            this.initialized = true;
        });

        bot.on("death", () => {
            this.reset(false);
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

            if (reason == "kick") {
                console.log("mc bot kicked... rejoining server in 5s");
                setTimeout(this.start, 5000);
            } else {
                console.error("ERROR: mc bot ended unexpectedly");
            }
        });

        // @ts-ignore
        bot.on("chat:tpaDenied", async () => {
            bot.chat(`/msg ${this.currentOrder!.minecraftUsername} You canceled your order last minute. Be better.`)
            this.reset(true);
        });

        // @ts-ignore
        bot.on("chat:tpaFail", async () => {
            this.reset(true);
        });

        // @ts-ignore
        bot.on("chat:tpaSent", () => {
            this.orderReady = false;
        });

        // @ts-ignore
        bot.on("chat:tpaSuccess", async () => {
            await bot.waitForTicks(20);
            bot.chat(`/msg ${this.currentOrder!.minecraftUsername} Please kill me to receive your order.`)
        });

        // @ts-ignore
        bot.on("chat:tpaTimeout", async () => {
            if (this.currentOrder && this.servicingOrder) {
                if (this.tpaTimeoutCount++ >= 3) {
                    bot.chat(`/msg ${this.currentOrder.minecraftUsername} Your delivery has timed out due to you not accepting the tpa request. Be better.`);
                    this.reset(true);
                    return;
                }

                bot.chat(`/msg ${this.currentOrder.minecraftUsername} Please accept the tpa request for your delivery.`);
            }
        });

        bot.on("time", async () => {
            if (!this.initialized) return;

            if (this.currentOrder && this.orderReady) {
                bot.chat(`/tpa ${this.currentOrder!.minecraftUsername}`);
                return;
            }

            if (this.servicingOrder) return;

            if (this.currentOrder = getNextOrder()) {
                this.servicingOrder = true;

                if (!bot.players[this.currentOrder!.minecraftUsername]) {
                    console.log(`${this.currentOrder!.minecraftUsername} is not online, defering order`);

                    placeOrder(this.currentOrder!);
                    this.reset(false);
                    return;
                }

                await bot.waitForTicks(20);
                for (const kitId of this.currentOrder!.kits) {
                    if (!await this.acquireKit(kitId)) {
                        await collections.kits!.updateOne({kitId: kitId}, {$set: {inStock: false}});
                        console.log(`WARNING: kit (id: ${kitId}) needs to be restocked`);
                        this.reset(true);
                        return;
                    }
                }

                bot.chat(`/msg ${this.currentOrder!.minecraftUsername} Your order is ready and will be delivered to you as soon as possible.`);
                this.orderReady = true;
            }
        });
    }

    public stop() {
        console.log("stopping mc bot");
        this.bot!.end("stop");
        this.bot = undefined;
    }
}
