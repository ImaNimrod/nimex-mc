const { SlashCommandBuilder } = require("discord.js");

const Order = require("../models/order");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("list_orders")
    .setDescription("Lists the pending orders"),

    async execute(interaction, client) {
        if (!interaction.member.roles.cache.some(role => role.name === global.config.discordKitManagementRole)) {
            return interaction.reply({
                content: "You do not have permission to use this command.",
                ephemeral: true,
            });
        }

        const orders = await Order.find({ discordGuildId: interaction.guild.id, delivered: false, canceled: false }).sort({ createdAt: 1 });
        if (orders.length == 0) {
            return await interaction.reply({
                content: "No pending orders.",
                ephemeral: true,
            });
        }

        const embed = {
            title: "__Pending Orders:__",
            color: 0xb78e60,
            fields: [],
            footer: { text: "Nimrod Express" },
        };

        for (const order of orders) {
            embed.fields.push({
                name: `__${order.discordUsername}__ placed an order for __${order.minecraftUsername}__`,
                value: order.kitIds.join(", "),
            });
        }

        await interaction.reply({
            embeds: [embed],
            ephemeral: true,
        });
    }
}
