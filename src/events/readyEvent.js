const { ActivityType, REST, Routes } = require("discord.js");

module.exports = {
    name: "ready",
    once: true,

    async execute(client) {
        client.user.setStatus("online");
        client.user.setActivity("for kit orders", { type: ActivityType.Watching });

        const rest = new REST({version: "10"}).setToken(process.env.DISCORD_TOKEN);
        await rest.put(Routes.applicationCommands(client.user.id), { body: client.commandArray });

        console.log("discord slash commands registered");
        console.log(`discord bot (${client.user.tag}) is online`);
    }
}
