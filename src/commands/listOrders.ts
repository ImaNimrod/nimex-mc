import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

import { getCollections } from "../mongo";
import Command from "../structs/command";

export default class ListOrders extends Command {
    name = "list_orders";
    description = "Lists the pending kit orders";

    async execute(interaction: ChatInputCommandInteraction) {
        if (!this.client.config.discordPrivledgedUsernames.includes(interaction.user.username)) {
            await interaction.reply({
                content: "You do not have permission to use this command.",
                ephemeral: true,
            });
            return;
        }

        const orders = await getCollections().orders.find({ delivered: false }).toArray();
        if (orders.length == 0) {
            await interaction.reply({
                content: "No currently pending orders.",
                ephemeral: true,
            });
            return;
        }

        const fields: any = [];

        for (const order of orders) {
            fields.push({
                name: `__${order.discordUsername}__ placed an order for __${order.minecraftUsername}__`,
                value: order.kitIds.join(", "),
            });
        }

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle("__Pending Orders:__")
                .addFields(fields)
                .setColor(0xb78e60)
                .setTimestamp()
                .setFooter({ text: "Nimrod Express" }),
            ],
            ephemeral: true,
        });
    }
}
