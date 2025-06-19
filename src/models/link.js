const mongoose = require("mongoose");

const linkSchema = new mongoose.Schema({
    discordUserId: { type: String, required: true, unique: true },
    minecraftUsername: { type: String, required: true },
    createdAt: { type: Date, default: Date.now(), required: true },
});

module.exports = mongoose.model("Link", linkSchema, "links");
