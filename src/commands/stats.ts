import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

import { getCollections } from "../mongo";
import Command from "../structs/command";

export default class Stats extends Command {
    name = "stats";
    description = "Displays the Nimrod Express' impressive kit delivery stats";

    async execute(interaction: ChatInputCommandInteraction) {
        const kitsInStockCount = await getCollections().kits.count({ inStock: true });
        const ordersDeliveredCount = await getCollections().orders.count({ delivered: true });
        const ordersPendingCount = await getCollections().orders.count({ delivered: false });

        const fields: any = [
            { name: "__Kits in Stock:__", value: kitsInStockCount.toString() },
            { name: "__Orders Pending:__", value: ordersPendingCount.toString() },
            { name: "__Total Orders Delivered:__", value: ordersDeliveredCount.toString() },
        ];

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("__Kit Delivery Statistics:__")
                    .setDescription("Thank you for choosing the Nimrod Express")
                    .addFields(fields)
                    .setColor(0xb78e60)
                    .setTimestamp()
                    .setFooter({ text: "Nimrod Express" }),
            ],
        });
    }
}
