import { Interaction } from "discord.js";

import Event from "../structs/event";

export default class InteractionCreate extends Event {
    name = "interactionCreate";

    async execute(interaction: Interaction) {
        if (!interaction.isChatInputCommand()) return;

        const command = this.client.commands.get(interaction.commandName);
        return command!.execute(interaction);
    }
}
