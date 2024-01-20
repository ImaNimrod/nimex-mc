import { REST } from "@discordjs/rest";
import { ActivityType } from "discord.js";
import { Routes } from "discord-api-types/v10";

import Event from "../structs/event";

export default class Ready extends Event {
    name = "ready";
    once = true;

    async execute() {
        await this.client.user?.setPresence({
            status: "online",
            activities: [
                {
                    name: "for kit orders",
                    type: ActivityType.Listening,
                }
            ],
        });

        const commandJSON = this.client.commands.map((c) => c.toJSON());
        const rest = new REST({ version: "10" }).setToken(this.client.config.discordToken);

        await rest.put(Routes.applicationCommands(this.client.user?.id || "missing id"), { body: commandJSON });
        console.log("discord slash commands registered");

        console.log(`discord bot (${this.client.user?.username}) online`);
    }
}
