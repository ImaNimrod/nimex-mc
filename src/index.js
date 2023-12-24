const { Client, Collection, GatewayIntentBits, IntentsBitField } = require("discord.js");
const mongoose = require("mongoose");
const Bot = require("./bot");

require("dotenv").config();

const client = new Client({
    intents: [
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});

client.commands = new Collection();

const bot = new Bot(
    process.env.MC_USERNAME,
    process.env.MC_PASSWORD,
);

(async () => {
    mongoose.set("strictQuery", false);
    await mongoose.connect(process.env.MONGODB_URI);

    require("./handlers/commandHandler")(client);
    require("./handlers/eventHandler")(client);

    client.handleCommands();
    client.handleEvents();
    client.login(process.env.DISCORD_TOKEN);

    bot.start();
})().catch((err) => console.error(err));
