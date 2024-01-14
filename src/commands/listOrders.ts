import { CommandInteraction, EmbedBuilder } from "discord.js";

import { getOrders, Order } from "../models/order";
import Command from "../structs/command";

export default class ListOrders extends Command {
    name = "list_orders";
    description = "Lists the pending kit orders";

    async execute(interaction: CommandInteraction) {
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

        const embed = new EmbedBuilder()
            .setTitle("__Pending Orders:__")
            .addFields(fields)
            .setColor(0xb78e60)
            .setTimestamp()
            .setFooter({ text: "Nimrod Express" });

        await interaction.reply({
            embeds: [embed],
            ephemeral: true,
        });
    }
}
