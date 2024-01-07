import { Client, Collection, GatewayIntentBits, IntentsBitField } from "discord.js";
import * as dotenv from "dotenv";
import * as mongoose from "mongoose";
import Deliverer from "./deliverer";

dotenv.config();

const client: Client = new Client({
    intents: [
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});

const deliverer: Deliverer = new Deliverer(
    process.env.MC_USERNAME!,
    process.env.MC_PASSWORD!,
);

(async () => {
    mongoose.set("strictQuery", false);
    await mongoose.connect(process.env.MONGODB_URI!);

    client.login(process.env.DISCORD_TOKEN!);

    deliverer.start();
})().catch((err) => console.error(err));
