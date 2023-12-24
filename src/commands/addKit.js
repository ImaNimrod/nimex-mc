const { SlashCommandBuilder } = require("discord.js");
const Kit = require("../models/kitModel");

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
                                     .setDescription("The EXACT ingame name of the kit")
                                     .setRequired(true)),

    async execute(interaction, client) {
        const newKit = new Kit({
            name: interaction.options.getString("name"),
            description: interaction.options.getString("description"),
            kitId: interaction.options.getString("kit_id"),
        });

        await newKit.save();

        const embed = {
            title: "__Kit Added:__",
            color: 0xb78e60,
            fields: [
                {
                    name: "__Name:__",
                    value: newKit.name,
                },
                {
                    name: "__Description:__",
                    value: newKit.description,
                },
                {
                    name: "__Kit ID:__",
                    value: newKit.kitId,
                },
            ],
            footer: { text: "Nimrod Express" },
        };

        await interaction.reply({
            embeds: [embed],
            ephemeral: true,
        });
    }
}
