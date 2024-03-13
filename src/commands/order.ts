import { SlashCommandStringOption } from "@discordjs/builders";
import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

import OrderModel from "../models/order";
import { getCollections } from "../mongo";
import Command from "../structs/command";

export default class Order extends Command {
    name = "order";
    description = "Places an order for your selection of kits";
    options = [
        new SlashCommandStringOption()
        .setName("mc_username")
        .setDescription("The ingame username of the player you want the order delivered to")
        .setRequired(true),
        new SlashCommandStringOption()
        .setName("kit1")
        .setDescription("Kit #1")
        .setRequired(true),
        new SlashCommandStringOption()
        .setName("kit2")
        .setDescription("Kit #2"),
        new SlashCommandStringOption()
        .setName("kit3")
        .setDescription("Kit #3"),
        new SlashCommandStringOption()
        .setName("kit4")
        .setDescription("Kit #4"),
    ];

    async execute(interaction: ChatInputCommandInteraction) {
        if (!this.client.initialized) {
            await interaction.reply({
                content: `Delivery bot is still initializing... Try again in a couple seconds.`,
                ephemeral: true,
            });
            return;
        }

        const minecraftUsername: string = interaction.options.getString("mc_username")!;
        if (!this.client.bot?.players[minecraftUsername]) {
            await interaction.reply({
                content: `Player **${minecraftUsername}** is not currently online.`,
                ephemeral: true,
            });
            return;
        }

        const duplicateUserOrder = await getCollections().orders.findOne({
            delivered: false,
            discordUsername: interaction.user.username,
        });

        if (duplicateUserOrder) {
            await interaction.reply({
                content: "Please wait for your pending order to be delivered before placing another order.",
                ephemeral: true,
            });
            return;
        }

        const mostRecentOrder = await getCollections().orders.findOne({
            delivered: true,
            discordUsername: interaction.user.username,
        }, { sort: { createdAt: -1 }});

        if (mostRecentOrder) {
            const diff = (Date.now() - mostRecentOrder.createdAt.getTime()) / 1000;

            if (diff < this.client.config.orderCooldown) {
                const cooldownRemainingMinutes = Math.ceil((this.client.config.orderCooldown - diff) / 60);

                await interaction.reply({
                    content: `You can only place one order every ${this.client.config.orderCooldown / 60} minutes. Please wait another **${cooldownRemainingMinutes} minutes** before ordering again.`,
                    ephemeral: true,
                });
                return;
            }
        }

        const kitIds: string[] = [];

        for (let i = 1; i <= 4; i++) {
            const kitName: string | null = interaction.options.getString(`kit${i}`);
            if (kitName == null) continue;

            const kit = await getCollections().kits.findOne({ name: kitName.toLowerCase(), inStock: true });
            if (!kit) {
                await interaction.reply({
                    content: `Kit **(name: __${kitName}__)** either out of stock or not found.`,
                    ephemeral: true,
                });
                return;
            }

            kitIds.push(kit.kitId);
        }

        const order: OrderModel = {
            discordGuildId: interaction.guild!.id,
            discordUsername: interaction.user.username,
            minecraftUsername: minecraftUsername,
            kitIds: kitIds,
            delivered: false,
            createdAt: new Date(),
            deliveredAt: undefined,
        };

        await getCollections().orders.insertOne(order);

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle("__Order Placed:__")
                .setDescription("The account selected will be notified ingame on the status of your order")
                .setColor(0xb78e60)
                .setTimestamp()
                .setFooter({ text: "Nimrod Express" }),
            ],
            ephemeral: true,
        });
    }
}
