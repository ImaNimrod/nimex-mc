const mongoose = require("mongoose");

const kitSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    kitId: { type: String, required: true },
    discordGuildId: { type: String, required: true },
    inStock: { type: Boolean, default: true, required: true },
    createdAt: { type: Date, default: Date.now(), required: true },
    updatedAt: { type: Date, default: Date.now(), required: true },
});

kitSchema.index({ name: 1, discordGuildId: 1 }, { unique: true });
kitSchema.index({ kitId: 1, discordGuildId: 1 }, { unique: true });

module.exports = mongoose.model("Kit", kitSchema, "kits");
