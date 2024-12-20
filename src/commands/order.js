const { SlashCommandBuilder } = require("discord.js");

const Kit = require("../models/kit");
const Order = require("../models/order");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("order")
    .setDescription("Places an order for your selection of kits")
    .addStringOption(option => option.setName("mc_username")
        .setDescription("The Minecraft username of the account you want the kits delivered to")
        .setRequired(true))
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
        .setRequired(false)),

    async execute(interaction, client) {
        const kitIds = [];

        for (let i = 1; i < 4; i++) {
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
                    ephemeral: true,
                });
            }
        }

        const order = new Order({
            discordGuildId: interaction.guild.id,
            discordUsername: interaction.user.username,
            minecraftUsername: interaction.options.getString("mc_username"),
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
            ephemeral: true,
        });
    }
}
