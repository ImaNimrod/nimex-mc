const { MessageFlags, SlashCommandBuilder } = require("discord.js");

const Kit = require("../models/kit");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("delete_kit")
    .setDescription("Deletes a kit from the stock")
    .addStringOption(option => option.setName("kit")
        .setDescription("Name of kit")
        .setRequired(true)),

    async execute(interaction, client) {
        if (!interaction.member.roles.cache.some(role => role.name === global.config.discordKitManagementRole)) {
            return interaction.reply({
                content: "You do not have permission to use this command.",
                flags: MessageFlags.Ephemeral,
            });
        }

        const kitName = interaction.options.getString("kit");

        const result = await Kit.deleteOne({
            name: kitName,
            discordGuildId: interaction.guild.id,
        });

        if (result.deletedCount == 0) {
            await interaction.reply({
                content: `Kit **'${kitName}'** not found.`,
                flags: MessageFlags.Ephemeral,
            });
        } else {
            const embed = {
                title: "__Kit Deleted:__",
                description: `Removed kit **'${kitName}'** from the stock`,
                color: 0xb78e60,
                footer: { text: "Nimrod Express" },
            };

            await interaction.reply({
                embeds: [embed],
                flags: MessageFlags.Ephemeral,
            });
        }
    }
}
