import { SlashCommandStringOption } from "@discordjs/builders";
import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

import { placeOrder } from "../models/order";
import { collections } from "../mongo";
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
        const minecraftUsername: string = interaction.options.getString("mc_username")!;
        if (!this.client.bot?.players[minecraftUsername]) {
            await interaction.reply({
                content: `Player **${minecraftUsername}** is not currently online.`,
                ephemeral: true,
            });
        }

        const kits: string[] = [];

        for (let i = 1; i < 4; i++) {
            const kitName: string | null = interaction.options.getString(`kit${i}`);
            if (kitName == null) continue;

            const kit = (await collections.kits!.findOne({ name: kitName }));
            if (!kit) {
                await interaction.reply({
                    content: `Kit **(name: __${kitName}__)** either out of stock or not found.`,
                    ephemeral: true,
                });
                return;
            }

            kits.push(kit.kitId);
        }

        placeOrder({
            discordUsername: interaction.user.username,
            minecraftUsername: minecraftUsername,
            kits: kits,
        });

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("__Order Placed:__")
                    .setDescription("The account selected will notified ingame on the status of your order")
                    .setColor(0xb78e60)
                    .setTimestamp()
                    .setFooter({ text: "Nimrod Express" }),
            ],
            ephemeral: true,
        });
    }
}
