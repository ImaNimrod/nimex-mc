const { MessageFlags } = require("discord.js");

module.exports = {
    name: "interactionCreate",

    async execute(interaction, client) {
        if (!interaction.isChatInputCommand()) {
            return;
        }

        const command = client.commands.get(interaction.commandName);
        if (!command) {
            return;
        }

        try {
            await command.execute(interaction);
        } catch (err) {
            console.error(err);

            await interaction.reply({
                content: "An error occured while executing this command.",
                flags: MessageFlags.Ephemeral,
            });
        }
    }
};
