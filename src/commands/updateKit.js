const { SlashCommandBuilder } = require("discord.js");

const Kit = require("../models/kit");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("update_kit")
    .setDescription("Updates a kit")
    .addStringOption(option => option.setName("kit")
        .setDescription("Name of the kit")
        .setRequired(true))
    .addStringOption(option => option.setName("description")
        .setDescription("Description of the kit")
        .setRequired(false))
    .addBooleanOption(option => option.setName("in_stock")
        .setDescription("Whether or not the kit is in stock")
        .setRequired(false)),

    async execute(interaction, client) {
        if (!interaction.member.roles.cache.some(role => role.name === global.config.discordKitManagementRole)) {
            return interaction.reply({
                content: "You do not have permission to use this command.",
                ephemeral: true,
            });
        }

        const kitName = interaction.options.getString("kit");

        const kit = await Kit.findOne({
            name: kitName,
            discordGuildId: interaction.guild.id,
        });

        if (!kit) {
            return await interaction.reply({
                content: `Kit **${kitName}** not found.`,
                ephemeral: true,
            });
        }

        if (interaction.options.getString("description") != undefined) {
            kit.description = interaction.options.getString("description");
        }
        if (interaction.options.getBoolean("in_stock") != undefined) {
            kit.inStock = interaction.options.getBoolean("in_stock");
        }

        await kit.save();

        const embed = {
            title: `__Updated kit ${kitName}:__`,
            color: 0xb78e60,
            footer: { text: "Nimrod Express" },
        };

        await interaction.reply({
            embeds: [embed],
            ephemeral: true,
        });
    }
}
