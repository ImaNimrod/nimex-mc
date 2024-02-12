import { SlashCommandBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction, RESTPostAPIApplicationCommandsJSONBody } from "discord.js";

import Deliverer from "../deliverer";

export default abstract class Command {
    protected readonly client: Deliverer;
    name: string = "";
    description: string = "No description provided.";
    options: any[] = [];
    dmPermission: boolean = false;

    protected constructor(client: Deliverer) {
        this.client = client;
    }

    abstract execute(interaction: ChatInputCommandInteraction): void | Promise<void>;

    toJSON(): RESTPostAPIApplicationCommandsJSONBody {
        const command = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .setDMPermission(this.dmPermission)

        this.options.forEach((o) => command.options.push(o));

        return command.toJSON();
    }
}
