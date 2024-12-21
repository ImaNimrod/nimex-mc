const { Client, Collection, IntentsBitField } = require("discord.js");
const express = require("express"); 
const fs = require("fs");
const createError = require("http-errors");
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

    const app = express();

    app.use(express.json());

    app.use("/kits", require("./routes/kits"));

    app.use((req, res, next) => {
        next(createError(404, "Not found"));
    });

    app.use((err, req, res, next) => {
        res.status(err.status || 500);
        res.send({
            error: {
                status: err.status || 500,
                message: err.message,
            }
        });
    });

    app.listen(global.config.apiPort, () => {
        console.log(`api started on 127.0.0.1:${global.config.apiPort}`);
    });

    const deliveryBot = new DeliveryBot();
    deliveryBot.start();
})().catch(console.error);
