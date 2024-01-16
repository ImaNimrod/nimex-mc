import { Interaction } from "discord.js";

import Event from "../structs/event";

export default class InteractionCreate extends Event {
    name = "interactionCreate";

    async execute(interaction: Interaction) {
        if (!interaction.isChatInputCommand()) return;

        const command = this.client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command!.execute(interaction);
        } catch (err) {
            console.error(err);

            await interaction.reply({
                content: "An error occured while executing this command.",
                ephemeral: true,
            });
        }
    }
}

