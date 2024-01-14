const fs = require("fs");
const path = require("path");

require("dotenv").config();

module.exports = (client) => {
    client.handleCommands = async () => {
        client.commandArray = [];

        let commandDir = path.join(__dirname, "..", "commands");
        const commandFiles = fs.readdirSync(commandDir).filter(file => file.endsWith(".js"));

        for (const file of commandFiles) {
            const command = require(`${commandDir}/${file}`);

            client.commands.set(command.data.name, command);
            client.commandArray.push(command.data.toJSON());
        }
    };
};
