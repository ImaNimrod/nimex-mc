const { MessageFlags, SlashCommandBuilder } = require("discord.js");

const Kit = require("../models/kit");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("add_kit")
    .setDescription("Adds a kit to stock")
    .addStringOption(option => option.setName("name")
        .setDescription("The display name of the kit")
        .setRequired(true))
    .addStringOption(option => option.setName("description")
        .setDescription("A description of the kit's contents")
        .setRequired(true))
    .addStringOption(option => option.setName("kit_id")
        .setDescription("The EXACT unique ingame name of the kit")
        .setRequired(true)),

    async execute(interaction, client) {
        if (!interaction.member.roles.cache.some(role => role.name === global.config.discordKitManagementRole)) {
            return interaction.reply({
                content: "You do not have permission to use this command.",
                flags: MessageFlags.Ephemeral,
            });
        }

        const kit = new Kit({
            name: interaction.options.getString("name"),
            description: interaction.options.getString("description"),
            kitId: interaction.options.getString("kit_id"),
            discordGuildId: interaction.guild.id,
        });

        try {
            await kit.save();
        } catch (err) {
            if (err.errmsg?.toString().includes("duplicate")) {
                return await interaction.reply({
                    content: "**Unable to create kit:** duplicate value provided for either kit name or ID.",
                    flags: MessageFlags.Ephemeral,
                });
            } else {
                throw err;
            }
        }

        const embed = {
            title: "__Kit Added:__",
            color: 0xb78e60,
            fields: [
                { name: "__Name:__", value: kit.name, inline: true },
                { name: "__Description:__", value: kit.description, inline: true },
                { name: "__Kit ID:__", value: kit.kitId, inline: true },
            ],
            footer: { text: "Nimrod Express" },
        }

        await interaction.reply({
            embeds: [embed],
            flags: MessageFlags.Ephemeral,
        });
    }
}
