import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

import Order, { getOrders } from "../models/order";
import Command from "../structs/command";

export default class ListOrders extends Command {
    name = "list_orders";
    description = "Lists the pending kit orders";

    async execute(interaction: ChatInputCommandInteraction) {
        const fields: any = [];
        const orders: Order[] = getOrders();
        if (!orders?.length) {
            await interaction.reply({
                content: "No pending orders.",
                ephemeral: true,
            });
            return;
        }

        orders.forEach((o) => fields.push({
            name: `__${o.discordUsername}__ placed an order for __${o.minecraftUsername}__`,
            value: o.kits.join(", "),
        }));

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
