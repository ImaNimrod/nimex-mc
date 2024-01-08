import * as dotenv from "dotenv";

import DiscordClient from "./client";
import Deliverer from "./deliverer";
import loadEvents from "./handlers/eventHandler";
import connectToDatabase from "./mongo";

dotenv.config();

const client: DiscordClient = new DiscordClient();

const deliverer: Deliverer = new Deliverer(
    process.env.MC_USERNAME!,
    process.env.MC_PASSWORD!,
);

(async () => {
    await connectToDatabase(process.env.MONGODB_URI!, process.env.MONGODB_DB_NAME!);

    await client.deployCommands();
    client.login(process.env.DISCORD_TOKEN!);

    deliverer.start();
})().catch((err) => console.error(err));
