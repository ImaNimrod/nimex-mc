const { ActivityType } = require("discord.js");

module.exports = {
    name: "ready",
    once: true,

    async execute(client) {
        client.user.setStatus("online");
        client.user.setActivity("for kit orders", { type: ActivityType.Watching });
        console.log(`discord bot (${client.user.tag}) is online`);
    }
}
