const { SlashCommandBuilder } = require("discord.js");
const { listOrders } = require("../models/orderModel");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("list_orders")
    .setDescription("Lists the pending orders"),

    async execute(interaction, client) {
        const privledgedRole = await interaction.guild.roles.fetch(process.env.DISCORD_PRIVLEDGED_ROLE_ID.toString());
        if (!interaction.member.roles.cache.has(privledgedRole.id)) {
            await interaction.reply({
                content: "You do not have permission to use this command.",
                ephemeral: true,
            });
            return;
        }

        const orders = listOrders();
        if (!orders?.length) {
            await interaction.reply({
                content: "No pending orders.",
                ephemeral: true,
            });

            return;
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
                value: order.kits.join(", "),
            });
        }

        await interaction.reply({
            embeds: [embed],
            ephemeral: true,
        });
    }
}
