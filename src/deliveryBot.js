const EventEmitter = require("events");
const mineflayer = require("mineflayer");
const { Movements, goals, pathfinder } = require("mineflayer-pathfinder");
const { solveMaze } = require("mineflayer-world-utils");

const Kit = require("./models/kit");
const Order = require("./models/order");

class DeliveryBot extends EventEmitter {
    bot = null;
    initialized = false;
    stashChests = null;

    currentOrder = null;
    servicingOrder = false;
    orderReady = false;
    tpaFails = 0;

    async acquireKit(kitId) {
        for (const chest of this.stashChests) {
            const openedChest = await this.bot.openContainer(this.bot.world.getBlock(chest));

            for (const item of openedChest.containerItems()) {
                if (!item.name.includes("shulker_box") || !item.customName) {
                    continue;
                }

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

    async acquireNetherite(count) {
        for (const chest of this.stashChests) {
            const openedChest = await this.bot.openContainer(this.bot.world.getBlock(chest));

            for (const item of openedChest.containerItems()) {
                if (item.name == "netherite_block") {
                    await openedChest.withdraw(item.type, null, count, null);
                    openedChest.close();
                    return true;
                }
            }

            openedChest.close();
        }

        return false;
    }

    async dropInventory() {
        for (const item of this.bot.inventory.slots) {
            if (!item) {
                continue;
            }
            await this.bot.tossStack(item);
        }
    }

    reset() {
        this.currentOrder = null;
        this.servicingOrder = false;
        this.orderReady = false;
        this.tpaFails = 0;
    }

    start() {
        const bot = mineflayer.createBot({
            version: global.config.minecraftVersion,
            host: "6b6t.org",
            username: global.config.minecraftUsername,
            auth: "offline",
            skipValidation: true,
            checkTimeoutInterval: 9999999,
        });

        bot.loadPlugin(pathfinder);

        this.bot = bot;

        bot.on("spawn", async () => {
            if (!this.initialized) {
                await bot.waitForTicks(20);

                bot.chat("/register " + global.config.minecraftPassword);
                await bot.waitForTicks(20);
                bot.chat("/login " + global.config.minecraftPassword);

                await bot.waitForTicks(20);

                if (global.config.captchaEnabled === true) {
                    await solveMaze(bot);
                }

                bot.pathfinder.setMovements(new Movements(bot, bot.registry));
                bot.pathfinder.setGoal(new goals.GoalNear(-999.5, 101, -987, 1));

                bot.once("goal_reached", async () => {
                    console.log(`mc bot ${bot.username} joining main server...`);

                    await bot.waitForTicks(60);

                    bot.addChatPattern("tpaDenied", /.*was denied!$/);
                    bot.addChatPattern("tpaFail", /Player not found!/);
                    bot.addChatPattern("tpaRequest", /(.+) wants to teleport to you.$/, { parse: true });
                    bot.addChatPattern("tpaSent", /Request sent to.*/);
                    bot.addChatPattern("tpaSuccess", /Teleported to.*/);
                    bot.addChatPattern("tpaTimeout", /Your teleport request to.*/);

                    await bot.waitForChunksToLoad();

                    await this.dropInventory();

                    this.stashChests = bot.findBlocks({
                        matching: block => block.name === "trapped_chest",
                        count: 200,
                    });

                    if (!this.stashChests?.length) {
                        console.error(`ERROR: mc bot ${bot.username} unable to find stash chests`);
                        console.log("mc bot restarting in 5s...");
                        setTimeout(this.bot.end.bind(this.bot), 5000);
                        return;
                    }

                    console.log(`mc bot ${bot.username} initialized`);
                    this.initialized = true;
                    this.emit("initialized");
                });

                return;
            }
        });

        bot.on("chat:tpaDenied", async () => {
            if (this.currentOrder && this.servicingOrder) {
                bot.chat(`/msg ${this.currentOrder.minecraftUsername} You canceled your order last minute. Be better.`)

                this.currentOrder.canceled = true;
                await this.currentOrder.save();

                await this.dropInventory();
                this.emit("orderCanceled");
                this.reset();
            }
        });

        bot.on("chat:tpaFail", async () => {
            if (this.currentOrder && this.servicingOrder) {
                if (this.tpaFails++ >= 5) {
                    bot.chat(`/msg ${this.currentOrder.minecraftUsername} Your delivery has timed out due to you not accepting the tpa request. Be better.`);

                    this.currentOrder.canceled = true;
                    await this.currentOrder.save();

                    await this.dropInventory();
                    this.emit("orderCanceled");
                    this.reset();
                }

                bot.chat(`/msg ${this.currentOrder.minecraftUsername} Please accept the tpa request for your delivery.`);
                this.orderReady = true;
            }
        });

        bot.on("chat:tpaRequest", (matches) => {
            if (matches[0] == "QuantumPapaya") {
                bot.chat("/tpy QuantumPapaya");
            }
        });

        bot.on("chat:tpaSent", () => {
            this.orderReady = false;
        });

        bot.on("chat:tpaSuccess", async () => {
            this.emit("orderDelivered");

            await bot.waitForTicks(20);
            bot.chat(`/msg ${this.currentOrder.minecraftUsername} Please kill me to receive your order.`)
        });

        bot.on("chat:tpaTimeout", async () => {
            if (this.currentOrder && this.servicingOrder) {
                if (this.tpaFails++ >= 5) {
                    bot.chat(`/msg ${this.currentOrder.minecraftUsername} Your delivery has timed out due to you not accepting the tpa request. Be better.`);

                    this.currentOrder.canceled = true;
                    await this.currentOrder.save();

                    await this.dropInventory();
                    this.emit("orderCanceled");
                    this.reset();
                    return;
                }

                bot.chat(`/msg ${this.currentOrder.minecraftUsername} Please accept the tpa request for your delivery.`);
                this.orderReady = true;
            }
        });

        bot.on("death", async () => {
            if (this.currentOrder && this.servicingOrder) {
                console.log(`order completed for ${this.currentOrder.minecraftUsername}`);

                this.currentOrder.delivered = true;
                this.currentOrder.deliveredAt = Date.now();
                await this.currentOrder.save();

                this.reset();
            }
        });

        bot.on("end", (_) => {
            bot.removeAllListeners();

            this.reset();
            this.bot = null;
            this.initialized = false;
            this.stashChests = null;

            this.start()
        });

        bot.on("kicked", (reason) => {
            console.error(`mc bot kick for reason: ${reason}`);
        });

        bot.on("time", async () => {
            if (!this.initialized) {
                return;
            }

            if (this.currentOrder && this.orderReady) {
                bot.chat(`/tpa ${this.currentOrder.minecraftUsername}`);
                return;
            }

            if (this.servicingOrder) {
                return;
            }

            const nextOrder = await Order.findOne({ delivered: false, canceled: false }).sort({ createdAt: 1 });
            if (!nextOrder) {
                return;
            }

            this.emit("newOrder");

            this.currentOrder = nextOrder;
            this.servicingOrder = true;

            await bot.waitForTicks(20);

            if (global.config.netheriteTpaEnabled === true) {
                while (!await this.acquireNetherite(global.config.netheriteCount)) {
                    console.log("waiting for netherite restock");
                }
            }

            for (const kitId of this.currentOrder.kitIds) {
                if (!await this.acquireKit(kitId)) {
                    console.log(`kit (id: ${kitId}) needs to be restocked, canceled order`);

                    await Kit.updateOne({
                        kitId: kitId,
                        discordGuildId: this.currentOrder.discordGuildId,
                    }, { $set: { inStock: false } });

                    this.currentOrder.canceled = true;
                    await this.currentOrder.save();

                    await this.dropInventory();
                    this.emit("orderCanceled");
                    this.reset();
                    return;
                }
            }

            if (!bot.players[this.currentOrder.minecraftUsername]) {
                console.log(`${this.currentOrder.minecraftUsername} is not online, canceled order`);

                this.currentOrder.canceled = true;
                await this.currentOrder.save();

                this.reset();

                await this.dropInventory();
                this.emit("orderCanceled");
                return;
            }

            bot.chat(`/msg ${this.currentOrder.minecraftUsername} Your order is ready and will be delivered to you as soon as possible.`);
            this.orderReady = true;
        });
    }
}

module.exports = DeliveryBot;
