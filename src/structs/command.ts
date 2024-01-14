import { SlashCommandBuilder } from "@discordjs/builders";
import { RESTPostAPIApplicationCommandsJSONBody } from "discord.js";

import Deliverer from "../deliverer";

export default abstract class Command {
    readonly client: Deliverer;
    name: string = "";
    description: string = "No description provided.";
    options: any[] = [];
    dmPermission: boolean | undefined;

    constructor(client: Deliverer) {
        this.client = client;
    }

    abstract execute(...args: any[]): any;

	toJSON(): RESTPostAPIApplicationCommandsJSONBody {
		const command = new SlashCommandBuilder()
			.setName(this.name)
			.setDescription(this.description)
            .setDMPermission(this.dmPermission);

		this.options.forEach((o) => command.options.push);

		return command.toJSON();
	}
}
