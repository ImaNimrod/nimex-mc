import { createBot, Bot } from "mineflayer";
import { Vec3 } from "vec3";

import { getNextOrder, placeOrder, Order } from "./models/order";

export default class Deliverer {
    private initialized: boolean = false;
    private stashChests: Vec3[] = [];
    private currentOrder: Order | null = null;
    private servicingOrder: boolean = false;
    private orderReady: boolean = false;
    private tpaTimeoutCount: number = 0;

    private bot: Bot | null = null;

    public constructor(public readonly username: string, private readonly password: string) {}

    public async reset(dropItems: boolean) {
        if (dropItems) {
            for (const item of this.bot!.inventory.slots) {
                if (!item) continue;
                await this.bot!.tossStack(item);
            }
        }

        this.currentOrder = null;
        this.servicingOrder = false;
        this.orderReady = false;
        this.tpaTimeoutCount = 0;
    }

    public start() {
        const bot: Bot = createBot({
            username: this.username,
            skipValidation: true,
            version: "1.19.4",
            host: "6b6t.org",
        });

        this.bot = bot;

        let inLobby: boolean = false;

        async function leaveLobby() {
            inLobby = true;

            bot.controlState.forward = true;
            await bot.waitForTicks(40);
            bot.controlState.forward = false;

            while (bot?.game?.difficulty == "peaceful") {
                bot.controlState.back = true;
                await bot.waitForTicks(20);
                bot.controlState.back = false;

                if (bot?.game?.difficulty == "peaceful") break;

                bot.controlState.forward = true;
                await bot.waitForTicks(30);
                bot.controlState.forward = false;
            }

            inLobby = false;
        }

        bot.once("spawn", async () => {
            bot.addChatPattern("tpaDenied", /.*was denied!$/);
            bot.addChatPattern("tpaFail", /Player not found!/);
            bot.addChatPattern("tpaSuccess", /Teleported to.*/);
            bot.addChatPattern("tpaTimeout", /Your teleport request to.*/);

            bot.chat("/login " + this.password);

            let lobbyCount: number = 0;

            while (true) {
                await bot.waitForTicks(20);

                if (lobbyCount > 30) {
                    this.stop()
                    break;
                }

                if (!bot.entity.position) continue;

                if (bot?.game?.difficulty != "hard") {
                    if (!inLobby) leaveLobby();
                    lobbyCount++;
                }
            }
        });

        bot.on("spawn", async () => {
            if (bot?.game?.difficulty == "peaceful") return;

            if (this.initialized) return;

            bot.controlState.forward = false;
            bot.controlState.back = false;

            console.log(bot.entity.position);

            await bot.waitForTicks(20);
            bot.chat("/tpy QuantumPapaya");

            this.stashChests = bot.findBlocks({
                matching: bot.registry.blocksByName["trapped_chest"].id,
                count: 20,
            });

            if (!this.stashChests.length) {
                console.error(`ERROR: mc bot ${this.username} unable to find stash chests`);
                this.stop()
                return;
            }

            console.log(`mc bot ${this.username} initialized`);
            this.initialized = true;
        });

        bot.on("death", () => {
            this.reset(false);
        });

        // @ts-ignore
        bot.on("chat:tpaDenied", async () => {
            bot.chat(`/msg ${this.currentOrder!.minecraftUsername} You canceled your order last minute. Be better.`)
            await this.reset(true);
        });

        // @ts-ignore
        bot.on("chat:tpaFail", async () => {
            await this.reset(true);
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

                /*
                await bot.waitForTicks(20);
                for (const kit of this.currentOrder!.kits) {
                    if (!await this.acquireKit(kit)) {
                        console.log(`WARNING: Kit (id: ${kit}) needs to be restocked`);
                        await Kit.updateOne({kitId: kit}, {$set: {inStock: false}});
                        this.reset(true);
                        return;
                    }
                }
                */

                bot.chat(`/msg ${this.currentOrder!.minecraftUsername} Your order is ready and will be delivered to you as soon as possible.`);
                this.orderReady = true;
            }
        });
    }

    public stop() {
        this.bot!.quit();
        this.bot = null;
    }
}
