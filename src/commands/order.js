const { SlashCommandBuilder } = require("discord.js");
const Kit = require("../models/kitModel");
const { Order, placeOrder } = require("../models/orderModel");

async function getKitIdFromName(name) {
    let kitId = null;

    await Kit.findOne({
        name: name,
        inStock: true,
    }).then((kit) => kitId = kit.kitId);

    return kitId;
}

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

        const kit1Name = interaction.options.getString("kit1");
        const kit2Name = interaction.options.getString("kit2");
        const kit3Name = interaction.options.getString("kit3");
        const kit4Name = interaction.options.getString("kit4");

        let kitId = await getKitIdFromName(kit1Name);
        if (!kitId) {
            await interaction.reply({
                content: `Invalid kit name: ${kit1Name}`,
                ephemeral: true,
            });

            return;
        }

        kits.push(kitId);

        if (kit2Name) {
            let kitId = await getKitIdFromName(kit2Name);
            if (!kitId) {
                await interaction.reply({
                    content: `Invalid kit name: ${kit2Name}`,
                    ephemeral: true,
                });

                return;
            }

            kits.push(kitId);
        }

        if (kit3Name) {
            let kitId = await getKitIdFromName(kit3Name);
            if (!kitId) {
                await interaction.reply({
                    content: `Invalid kit name: ${kit3Name}`,
                    ephemeral: true,
                });

                return;
            }

            kits.push(kitId);
        }

        if (kit4Name) {
            let kitId = await getKitIdFromName(kit4Name);
            if (!kitId) {
                await interaction.reply({
                    content: `Invalid kit name: ${kit4Name}`,
                    ephemeral: true,
                });

                return;
            }

            kits.push(kitId);
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
