import { Collection } from "discord.js";
import { readdirSync } from "fs";
import { join } from "path";

import Deliverer from "../deliverer";
import Event from "../structs/event";

export default function loadEvents(client: Deliverer): Collection<string, Event> {
    const events = new Collection<string, Event>();
    const path = join(__dirname, "..", "events");

    readdirSync(path)
    .filter(f => f.endsWith(".js"))
    .forEach(async (file) => {
        const eventClass = ((r) => r.default || r)(await import (`../events/${file}`));
        const event: Event = new eventClass(client);

        events.set(event.name, event);
        client[event.once ? "once" : "on"](event.name, (...args: unknown[]) => event.execute(...args));
    });

    return events;
}
