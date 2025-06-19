const { MessageFlags, SlashCommandBuilder } = require("discord.js");

const Link = require("../models/link");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("check_link")
    .setDescription("Checks if your Discord account is linked to a Minecraft account"),

    async execute(interaction, client) {
        const embed = {
            color: 0xb78e60,
            footer: { text: "Nimrod Express" },
        };

        const link = await Link.findOne({ discordUserId: interaction.user.id });
        if (link) {
            embed.title = "__Link found:__";
            embed.description = `${interaction.user.username} ---> ${link.minecraftUsername}`;
        } else {
            embed.title = "__Link not found:__";
            embed.description = "Use /link to link your Discord account to your Minecraft account";
        }

        await interaction.reply({
            embeds: [embed],
            flags: MessageFlags.Ephemeral,
        });
    }
}
