const { SlashCommandBuilder } = require("discord.js");
const Kit = require("../models/kitModel");
const { Order, placeOrder } = require("../models/orderModel");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("order")
    .setDescription("Places an order for your selection of kits")
    .addStringOption(option => option.setName("mc_username")
                                     .setDescription("The Minecraft username of the account you want the kits delivered to")
                                     .setRequired(true))
    .addStringOption(option => option.setName("kit1")
                                     .setDescription("Kit #1")
                                     .setRequired(true))
    .addStringOption(option => option.setName("kit2")
                                     .setDescription("Kit #2")
                                     .setRequired(false))
    .addStringOption(option => option.setName("kit3")
                                     .setDescription("Kit #3")
                                     .setRequired(false))
    .addStringOption(option => option.setName("kit4")
                                     .setDescription("Kit #4")
                                     .setRequired(false)),

    async execute(interaction, client) {
        const kits = [];

        let err = false;

        for (let i = 1; i < 4; i++) {
            const kitName = interaction.options.getString("kit" + i.toString());
            if (!kitName) continue;

            await Kit.findOne({ name: kitName })
                .then((kit) => kits.push(kit.kitId))
                .catch(async (_) => {
                    await interaction.reply({
                        content: `Kit **(name: __${kitName}__)** not found.`,
                        ephemeral: true,
                    });

                    err = true;
                });

            if (err) return;
        }

        placeOrder(new Order(
            interaction.user.username,
            interaction.options.getString("mc_username"),
            kits,
        ));

        const embed = {
            title: "__Order Placed:__",
            description: "The account selected will be notified in game on the status of the order",
            color: 0xb78e60,
            footer: { text: "Nimrod Express" },
        };

        await interaction.reply({
            embeds: [embed],
            ephemeral: true,
        });
    }
}
