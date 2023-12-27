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
        const privledgedRole = await interaction.guild.roles.fetch(process.env.DISCORD_PRIVLEDGED_ROLE_ID.toString());
        if (!interaction.member.roles.cache.has(privledgedRole.id)) {
            await interaction.reply({
                content: "You do not have permission to use this command.",
                ephemeral: true,
            });
            return;
        }
        
        const kit = await Kit.findOne({name: interaction.options.getString("kit")});

        if (!kit) {
            await interaction.reply({
                content: `Kit **(name: __${interaction.options.getString("kit")}__)** not found.`,
                ephemeral: true,
            });
            return;
        }

        kit.inStock = interaction.options.getBoolean("in_stock");

        await kit.save()
        .then(async (updatedKit) => {
            const embed = {
                title: "__Updated Kit:__",
                description: `Kit **(name: __${updatedKit.name}__)** is now **${updatedKit.inStock ? "in" : "out of"} stock**`,
                color: 0xb78e60,
                footer: { text: "Nimrod Express" },
            };

            await interaction.reply({
                embeds: [embed],
                ephemeral: true,
            });
        })
        .catch(async (_) => {
            await interaction.reply({
                content: "An internal error occured.",
                ephemeral: true,
            });
        });
    }
}
