import { SlashCommandStringOption } from "@discordjs/builders";
import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

import Kit from "../models/kit";
import { collections } from "../mongo";
import Command from "../structs/command";

export default class AddKit extends Command {
    name = "add_kit";
    description = "Adds a kit to the Nimrod Express' kit stock";
    options = [
        new SlashCommandStringOption()
            .setName("name")
            .setDescription("The display name of the kit")
            .setRequired(true),
        new SlashCommandStringOption()
            .setName("description")
            .setDescription("A description of the kit's content")
            .setRequired(true),
        new SlashCommandStringOption()
            .setName("kit_id")
            .setDescription("The EXACT ingame name of the shulker box")
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

        const newKit: Kit = {
            name: interaction.options.getString("name")!,
            description: interaction.options.getString("description")!,
            kitId: interaction.options.getString("kit_id")!,
            inStock: true,
            createdAt: new Date(),
        };

        await collections.kits!.insertOne(newKit);

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("__Kit Added:__")
                    .addFields(
                        { name: "__Name:__", value: newKit.name },
                        { name: "__Description:__", value: newKit.description },
                        { name: "__Kit ID:__", value: newKit.kitId },
                    )
                    .setColor(0xb78e60)
                    .setTimestamp()
                    .setFooter({ text: "Nimrod Express" }),
            ],
            ephemeral: true,
        });
    }
}
