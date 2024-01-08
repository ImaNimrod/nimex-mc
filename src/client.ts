import { Client, IntentsBitField } from "discord.js";
import { Routes } from "discord-api-types/v9";
import { REST } from "@discordjs/rest";

import loadCommands from "./handlers/commandHandler";
import loadEvents from "./handlers/eventHandler";

export default class DiscordClient extends Client {
    public commands = loadCommands(this);
    public events = loadEvents(this);

	constructor() {
		super({
			intents: [
                IntentsBitField.Flags.GuildMembers,
                IntentsBitField.Flags.GuildMessages,
                IntentsBitField.Flags.MessageContent,
			],
		});
	}

    async deployCommands() {
        const commandJSON = this.commands.map((c) => c.toJSON());
		const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN!);

        const guilds = this.guilds.cache;

        guilds.forEach((guild) => {
            rest.put(Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID!, guild.id), { body: commandJSON })
        });
    }
}
