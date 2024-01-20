import { SlashCommandStringOption } from "@discordjs/builders";
import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

import { collections } from "../mongo";
import Command from "../structs/command";

export default class DeleteKit extends Command {
    name = "delete_kit";
    description = "Removes a kit from the Nimrod Express' kit stock";
    options = [
        new SlashCommandStringOption()
            .setName("name")
            .setDescription("The display name of the kit")
            .setRequired(true),
    ];

    async execute(interaction: ChatInputCommandInteraction) {
        if (!this.client.config.discordPrivledgedUsernames.includes(interaction.user.username)) {
            await interaction.reply({
                content: "You do not have permission to use this command.",
                ephemeral: true,
            });
            return;
        }

        const kitName: string = interaction.options.getString("name")!;
        const result = await collections.kits!.deleteOne({ name: kitName });

        if (result && result.deletedCount) {
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle("__Kit Deleted:__")
                    .setDescription(`Kit **(name: __${kitName}__)** removed from the stock`)
                    .setColor(0xb78e60)
                    .setTimestamp()
                    .setFooter({ text: "Nimrod Express" }),
                ],
                ephemeral: true,
            });
        } else if (!result) {
            await interaction.reply({
                content: "Failed to remove kit.",
                ephemeral: true,
            });
        } else if (!result.deletedCount) {
            await interaction.reply({
                content: `Kit **(name: __${kitName}__)** not found.`,
                ephemeral: true,
            });
        }
    }
}
