import { Collection } from "discord.js";
import { readdirSync } from "fs";
import { join } from "path";

import Deliverer from "../deliverer";
import Command from "../structs/command";

export default function loadCommands(client: Deliverer): Collection<string, Command> {
    const commands = new Collection<string, Command>();
    const path = join(__dirname, "..", "commands");

    readdirSync(path)
        .filter(f => f.endsWith(".js"))
        .forEach(async (file) => {
			const commandClass = ((r) => r.default || r)(await import (`../commands/${file}`));
            const command: Command = new commandClass(client);

			commands.set(command.name, command);
        });

    return commands;
}
