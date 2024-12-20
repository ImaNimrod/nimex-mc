const { REST, Routes } = require("discord.js");

module.exports = {
    name: "ready",
    once: true,

    async execute(client) {
        if (process.argv.includes("register")) {
            const commandJSON = client.commands.map((c) => c.data.toJSON());

            const rest = new REST({version: "10"}).setToken(global.config.discordToken);
            await rest.put(Routes.applicationCommands(client.user.id), { body: commandJSON });

            console.log("registered discord bot slash commands");
            process.exit(0);
        }

        console.log(`discord bot ${client.user.username} online`);
    }
}
