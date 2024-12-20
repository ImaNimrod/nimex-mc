const { SlashCommandBuilder } = require("discord.js");

const Kit = require("../models/kit");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("list_kits")
    .setDescription("Lists the available selection of kits"),

    async execute(interaction, client) {
        const embed = {
            title: "__Kit Selection:__",
            color: 0xb78e60,
            fields: [],
            footer: { text: "Nimrod Express" },
        };

        const kits = await Kit.find({ discordGuildId: interaction.guild.id });
        for (const kit of kits) {
            embed.fields.push({
                name: `__${kit.name}__`.concat(kit.inStock ? "" : " (OUT OF STOCK)"),
                value: kit.description,
            });
        }

        await interaction.reply({
            embeds: [embed],
            ephemeral: true,
        });
    }
}
