const { SlashCommandBuilder } = require("discord.js");
const Kit = require("../models/kitModel");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("delete_kit")
    .setDescription("Deletes a kit from the stock")
    .addStringOption(option => option.setName("kit")
                                     .setDescription("Name of kit")
                                     .setRequired(true)),

    async execute(interaction, client) {
        const privledgedRole = await interaction.guild.roles.fetch(process.env.DISCORD_PRIVLEDGED_ROLE_ID.toString());
        if (!interaction.member.roles.cache.has(privledgedRole.id)) {
            await interaction.reply({
                content: "You do not have permission to use this command.",
                ephemeral: true,
            });
            return;
        }

        const kitName = interaction.options.getString("kit");

        await Kit.deleteOne({ name: kitName })
        .then(async (err, _) => {
            if (err?.deletedCount == 0) {
                await interaction.reply({
                    content: `Kit **(name: __${kitName}__)** not found.`,
                    ephemeral: true,
                });
                return;
            } else {
                const embed = {
                    title: "__Kit Deleted:__",
                    description: `Kit **(name: __${kitName}__)** removed from the stock`,
                    color: 0xb78e60,
                    footer: { text: "Nimrod Express" },
                };

                await interaction.reply({
                    embeds: [embed],
                    ephemeral: true,
                });
            }

        });
    }
}
