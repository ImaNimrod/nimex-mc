const mongoose = require("mongoose");

const kitSchema = new mongoose.Schema({
	name: { type: String, required: true },
	description: { type: String, required: true },
	kitId: { type: String, required: true },
	inStock: { type: Boolean, default: true, required: true },
	createdAt: { type: Date, default: Date.now(), required: true },
});

module.exports = mongoose.model("Kit", kitSchema, "kits");
