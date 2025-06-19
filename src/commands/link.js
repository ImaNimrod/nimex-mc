const { MessageFlags, SlashCommandBuilder } = require("discord.js");

const Link = require("../models/link");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("link")
    .setDescription("Links your Discord account to your Minecraft account")
    .addStringOption(option => option.setName("mc_username")
        .setDescription("The Minecraft username of the account you want the link")
        .setRequired(true)),

    async execute(interaction, client) {
        const minecraftUsername = interaction.options.getString("mc_username");

        if (!global.deliveryBot.bot?.players[minecraftUsername]) {
            return interaction.reply({
                content: "Player not online. Please join the server so that the link can be verifed.",
                flags: MessageFlags.Ephemeral,
            });
        }

        const result = await Link.findOneAndUpdate(
            { discordUserId: interaction.user.id },
            { minecraftUsername: minecraftUsername },
            { new: true, upsert: true },
        );

        const embed = {
            title: "__Link Created:__",
            description: "In the future, you can leave the 'mc_username' option blank when using /order to have kits automatically delivered to the chosen Minecraft username.",
            color: 0xb78e60,
            footer: { text: "Nimrod Express" },
        };

        await interaction.reply({
            embeds: [embed],
            flags: MessageFlags.Ephemeral,
        });
    }
}
