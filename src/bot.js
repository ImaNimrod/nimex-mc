const mineflayer = require("mineflayer");
const { mineflayer: mineflayerViewer } = require("prismarine-viewer");
const Kit = require("./models/kitModel");
const { getNextOrder, placeOrder } = require("./models/orderModel");

class Bot {
    constructor(username, password) {
        this.username = username;
        this.password = password;

        this.bot = null;

        this.initialized = false;
        this.stashChests = null;

        this.currentOrder = null;
        this.servicingOrder = false;
        this.orderReady = false;
        this.tpaTimeoutCount = 0;
    }

    async acquireKit(kitId) {
        for (const chest of this.stashChests) {
            const openedChest = await this.bot.openContainer(this.bot.world.getBlock(chest));

            for (const item of openedChest.containerItems()) {
                if (!item.name.includes("shulker_box") || !item.customName) continue;

                if (item.customName.includes(kitId)) {
                    await openedChest.withdraw(item.type, null, null, item.nbt);
                    openedChest.close();
                    return true;
                }
            }
 
            openedChest.close();
        }

        return false;
    }

    async reset(dropItems) {
        if (dropItems) {
            for (const item of this.bot.inventory.slots) {
                if (!item) continue;
                await this.bot.tossStack(item);
            }
        }

        this.currentOrder = null;
        this.servicingOrder = false;
        this.orderReady = false;
        this.tpaTimeoutCount = 0;
    }

    start() {
        const bot = mineflayer.createBot({
            username: this.username,
            skipValidation: true,
            version: "1.19.4",
            host: "6b6t.org",
        });

        this.bot = bot;

        let lobbyF = false;

        async function leaveLobby() {
            lobbyF = true;

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

            lobbyF = false;
        }

        bot.once("spawn", async () => {
            mineflayerViewer(bot, {
                port: 3007,
                firstPerson: false,
            });

            bot.addChatPattern("tpaDenied", /.*was denied!$/);
            bot.addChatPattern("tpaFail", /Player not found!/);
            bot.addChatPattern("tpaSuccess", /Teleported to.*/);
            bot.addChatPattern("tpaTimeout", /Your teleport request to.*/);

            bot.chat("/login " + this.password);

            let lobbyCount = 0;

            while (true) {
                await bot.waitForTicks(20);

                if (lobbyCount > 30) {
                    bot.end();
                    break;
                }

                if (!bot.entity?.position) continue;

                if (bot?.game?.difficulty != "hard") {
                    if (!lobbyF) leaveLobby();
                    lobbyCount++;
                }
            }
        });

        bot.on("spawn", async () => {
            if (bot?.game?.difficulty == "peaceful") return;

            if (!this.initialized) {
                bot.controlState.forward = false;
                bot.controlState.back = false;

                await bot.waitForTicks(40);
                bot.chat("/tpy QuantumPapaya");

                this.stashChests = bot.findBlocks({
                    matching: bot.registry.blocksByName["trapped_chest"].id,
                    count: 20,
                });

                if (!this.stashChests?.length) {
                    console.error(`ERROR: mc bot ${this.username} unable to find stash chests`);
                    bot.end();
                    return;
                }

                console.log(`mc bot ${this.username} initialized`);
                this.initialized = true;
            }
        });

        bot.on("death", () => {
            this.reset(false);
        });

        bot.on("chat:tpaDenied", async () => {
            bot.chat(`/msg ${this.currentOrder.minecraftUsername} You canceled your order last minute. Be better.`)
            this.reset(true);
        });

        bot.on("chat:tpaFail", async () => {
            this.reset(true);
        });

        bot.on("chat:tpaSuccess", async () => {
            await bot.waitForTicks(20);
            bot.chat(`/msg ${this.currentOrder.minecraftUsername} Please kill me to receive your order.`)
        });

        bot.on("chat:tpaTimeout", async () => {
            if (this.currentOrder && this.servicingOrder) {
                if (this.tpaTimeoutCounter++ >= 3) {
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
                bot.chat(`/tpa ${this.currentOrder.minecraftUsername}`);
                return;
            }

            if (this.servicingOrder) return;

            if (this.currentOrder = getNextOrder()) {
                this.servicingOrder = true;

                if (!bot.players[this.currentOrder?.minecraftUsername]) {
                    console.log(`${this.currentOrder.minecraftUsername} is not online, defering order`);

                    placeOrder(this.currentOrder);
                    this.reset(false);
                    return;
                }

                for (const kit of this.currentOrder.kits) {
                    if (!await this.acquireKit(kit)) {
                        console.log(`WARNING: Kit (id: ${kit}) needs to be restocked`);
                        await Kit.updateOne({kitId: kit}, {$set: {inStock: false}});
                        this.reset(true);
                        return;
                    }
                }

                bot.chat(`/msg ${this.currentOrder.minecraftUsername} Your order is ready and will be delivered to you as soon as possible.`);
                this.orderReady = true;
            }
        });
    }

    async stop() {
        this.bot.quit();
    }
}

module.exports = Bot;
