const { Interaction } = require("discord.js");

module.exports = {
    name: "interactionCreate",

    async execute(interaction, client) {
        if (!interaction.isCommand()) return;

        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        
        await command.execute(interaction, client).catch(async (err) => {
            console.error(`ERROR: an error occured while exexcuting the command '${interaction.commandName}': ${err}`);

            await interaction.reply({
                content: "An an error occured while executing this command", 
                ephemeral: true,
            });
        });
    }
};
