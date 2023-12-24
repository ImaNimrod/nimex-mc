const { SlashCommandBuilder } = require("discord.js");
const Kit = require("../models/kitModel");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("update_stock")
    .setDescription("Updates the 'inStock' status of a kit")
    .addStringOption(option => option.setName("kit")
                                     .setDescription("Name of the kit")
                                     .setRequired(true))
    .addBooleanOption(option => option.setName("in_stock")
                                     .setDescription("Whether or not the kit is in stock")
                                     .setRequired(true)),

    async execute(interaction, client) {
        const kitName = interaction.options.getString("kit");
        const inStock = interaction.options.getBoolean("in_stock");

        await Kit.updateOne({name: interaction.options.getString("kit")}, {$set: {inStock: interaction.options.getBoolean("in_stock")}})
            .then(async (updatedKit) => {
                const embed = {
                    title: "__Updated Kit:__",
                    description: `Kit __**${kitName}**__ is now **${inStock ? "in" : "out of"} stock**`,
                    color: 0xb78e60,
                    footer: { text: "Nimrod Express" },
                };

                await interaction.reply({
                    embeds: [embed],
                    ephemeral: true,
                });
            });
    }
}
