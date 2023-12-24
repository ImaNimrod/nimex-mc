const { SlashCommandBuilder } = require("discord.js");
const { listOrders } = require("../models/orderModel");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("list_orders")
    .setDescription("Lists the pending orders"),

    async execute(interaction, client) {
        const embed = {
            title: "__Pending Orders:__",
            color: 0xb78e60,
            fields: [],
            footer: { text: "Nimrod Express" },
        };

        for (const order of listOrders()) {
            embed.fields.push({
                name: `__${order.discordUsername}__ placed an order for __${order.minecraftUsername}__`,
                value: order.kits.reduce((acc, cur, idx) => acc +` ${idx + 1}.` + cur, '\n'),
            });
        }

        await interaction.reply({
            embeds: [embed],
            ephemeral: true,
        });
    }
}
