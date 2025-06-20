const { MessageFlags, SlashCommandBuilder } = require("discord.js");

const Kit = require("../models/kit");
const Link = require("../models/link");
const Order = require("../models/order");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("order")
    .setDescription("Places an order for your selection of kits")
    .addStringOption(option => option.setName("kit1")
        .setDescription("Kit #1")
        .setRequired(true))
    .addStringOption(option => option.setName("kit2")
        .setDescription("Kit #2")
        .setRequired(false))
    .addStringOption(option => option.setName("kit3")
        .setDescription("Kit #3")
        .setRequired(false))
    .addStringOption(option => option.setName("kit4")
        .setDescription("Kit #4")
        .setRequired(false))
    .addStringOption(option => option.setName("mc_username")
        .setDescription("The Minecraft username of the account you want the kits delivered to (leave blank to use your link)")
        .setRequired(false)),

    async execute(interaction, client) {
        let minecraftUsername = interaction.options.getString("mc_username");
        if (!minecraftUsername) {
            const link = await Link.findOne({ discordUserId: interaction.user.id });
            if (!link) {
                return await interaction.reply({
                    content: "Unable to determine Minecraft username for delivery. Please create a link or specify a username.",
                    flags: MessageFlags.Ephemeral,
                });
            }

            minecraftUsername = link.minecraftUsername;
        }

        const pendingOrders = await Order.find({ discordGuildId: interaction.guild.id, delivered: false, canceled: false }).sort({ createdAt: 1 });
        for (const order of pendingOrders) {
            if (order.minecraftUsername == minecraftUsername) {
                return await interaction.reply({
                    content: `There is already an order pending for **${order.minecraftUsername}**. Please wait for that order to completed.`,
                    flags: MessageFlags.Ephemeral,
                });
            }
        }

        const kitIds = [];

        for (let i = 1; i <= 4; i++) {
            const kitName = interaction.options.getString("kit" + i.toString());
            if (!kitName) {
                continue;
            }

            try {
                const kit = await Kit.findOne({
                    name: kitName,
                    discordGuildId: interaction.guild.id,
                });

                kitIds.push(kit.kitId);
            } catch (_) {
                return await interaction.reply({
                    content: `Kit '**${kitName}**' not found.`,
                    flags: MessageFlags.Ephemeral,
                });
            }
        }

        const order = new Order({
            discordGuildId: interaction.guild.id,
            discordUsername: interaction.user.username,
            minecraftUsername: minecraftUsername,
            kitIds: kitIds,
        });

        await order.save();

        const embed = {
            title: "__Order Placed:__",
            description: "The account selected will be notified ingame on the status of the order.",
            color: 0xb78e60,
            footer: { text: "Nimrod Express" },
        };

        await interaction.reply({
            embeds: [embed],
            flags: MessageFlags.Ephemeral,
        });
    }
}
