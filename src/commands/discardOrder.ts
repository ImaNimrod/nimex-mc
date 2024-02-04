import { SlashCommandStringOption } from "@discordjs/builders";
import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

import { getCollections } from "../mongo";
import Command from "../structs/command";

export default class DiscardOrder extends Command {
    name = "discard_order";
    description = "Skips over and deletes a pending order.";
    options = [
        new SlashCommandStringOption()
            .setName("order_username")
            .setDescription("The discord username of pending order")
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

        const orderDiscordUsername: string = interaction.options.getString("order_username")!;

        const result = await getCollections().orders.deleteOne({
            delivered: false,
            discordUsername: orderDiscordUsername
        });

        if (result && result.deletedCount) {
            if (orderDiscordUsername == this.client.currentOrder?.discordUsername) {
                await this.client.dropInventory();
                this.client.reset();
            }

            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("__Order Skipped:__")
                        .setDescription(`Pending order from **__${orderDiscordUsername}__** skipped and removed.`)
                        .setColor(0xb78e60)
                        .setTimestamp()
                        .setFooter({ text: "Nimrod Express" }),
                ],
                ephemeral: true,
            });
        } else if (!result) {
            await interaction.reply({
                content: "Failed to remove pending order.",
                ephemeral: true,
            });
        } else if (!result.deletedCount) {
            await interaction.reply({
                content: `No pending order from **__${orderDiscordUsername}__** found.`,
                ephemeral: true,
            });
        }
    }
}
