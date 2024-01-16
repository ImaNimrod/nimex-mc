import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

import { collections } from "../mongo";
import Command from "../structs/command";

export default class ListKits extends Command {
    name = "list_kits";
    description = "Lists the available selection of kits";

    async execute(interaction: ChatInputCommandInteraction) {
        const fields: any = [];
        const kits = await collections.kits!.find({}).toArray();
        if (!kits?.length) {
            await interaction.reply({
                content: "No kits available for delivery.",
                ephemeral: true,
            });
            return;
        }

        kits.forEach((k) => fields.push({
            name: `__${k.name}__`.concat(k.inStock ? "" : " (OUT OF STOCK)"),
            value: k.description,
        }));

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
