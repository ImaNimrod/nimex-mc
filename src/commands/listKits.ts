import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

import { getCollections } from "../mongo";
import Command from "../structs/command";

export default class ListKits extends Command {
    name = "list_kits";
    description = "Lists the available selection of kits";

    async execute(interaction: ChatInputCommandInteraction) {
        const kits = await getCollections().kits.find({}).toArray();
        if (kits.length == 0) {
            await interaction.reply({
                content: "No kits available for delivery.",
                ephemeral: true,
            });
            return;
        }

        const fields: any = [];

        for (const kit of kits) {
            fields.push({
                name: `__${kit.name}__`.concat(kit.inStock ? "" : " (OUT OF STOCK)"),
                value: kit.description,
            });
        }

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle("__Kit Selection:__")
                .addFields(fields)
                .setColor(0xb78e60)
                .setTimestamp()
                .setFooter({ text: "Nimrod Express" }),
            ],
            ephemeral: true,
        });
    }
}
