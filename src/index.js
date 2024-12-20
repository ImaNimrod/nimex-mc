const { Client, Collection, IntentsBitField } = require("discord.js");
const fs = require("fs");
const mongoose = require("mongoose");
const path = require("path");

const DeliveryBot = require("./deliveryBot");

(async () => {
    const configPath = process.argv[2];
    if (!configPath) {
        console.error("ERROR: no configuration file provided")
        process.exit(1);
    }

    global.config = JSON.parse(fs.readFileSync(configPath, "utf8"));

    const discordClient = new Client({
        intents: [
            IntentsBitField.Flags.Guilds,
            IntentsBitField.Flags.GuildMembers,
            IntentsBitField.Flags.GuildMessages,
            IntentsBitField.Flags.MessageContent,
        ],
    });

    discordClient.commands = new Collection();

    const commandDir = path.join(__dirname, "commands");
    const commandFiles = fs.readdirSync(commandDir).filter(file => file.endsWith(".js"));

    for (const file of commandFiles) {
        const command = require(`${commandDir}/${file}`);
        discordClient.commands.set(command.data.name, command);
    }

    const eventDir = path.join(__dirname, "events");
    const eventFiles = fs.readdirSync(eventDir).filter(file => file.endsWith(".js"));

    for (const file of eventFiles) {
        const event = require(`${eventDir}/${file}`);

        if (event.once) {
            discordClient.once(event.name, (...args) => event.execute(...args, discordClient));
        } else {
            discordClient.on(event.name, (...args) => event.execute(...args, discordClient));
        }
    }

    discordClient.login(global.config.discordToken);

    if (process.argv.includes("register")) {
        return;
    }

    mongoose.set("strictQuery", false);
    await mongoose.connect(global.config.mongodbUri);
    console.log("connected to MongoDB database");

    const deliveryBot = new DeliveryBot();
    deliveryBot.start();
})().catch(console.error);
