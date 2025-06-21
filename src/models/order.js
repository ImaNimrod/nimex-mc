const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    discordGuildId: { type: String, required: true },
    discordUsername: { type: String, required: true },
    minecraftUsername: { type: String, required: true },
    kitIds: { type: [String], required: true },
    delivered: { type: Boolean, default: false, required: true },
    canceled: { type: Boolean, default: false, required: true },
    bulk: { type: Boolean, default: false, required: true },
    createdAt: { type: Date, default: Date.now(), required: true },
    deliveredAt: { type: Date },
});

module.exports = mongoose.model("Order", orderSchema, "orders");
