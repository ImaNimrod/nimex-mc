const fs = require("fs");
const path = require("path");

module.exports = (client) => {
    client.handleEvents = async () => {
        let eventDir = path.join(__dirname, "..", "events");
        const eventFiles = fs.readdirSync(eventDir).filter(file => file.endsWith(".js"));

        for (const file of eventFiles) {
            const event = require(`${eventDir}/${file}`);

            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args, client));
            } else {
                client.on(event.name, (...args) => event.execute(...args, client));
            }
        }
    };
}
