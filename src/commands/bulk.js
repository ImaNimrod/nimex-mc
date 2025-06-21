const { MessageFlags, SlashCommandBuilder } = require("discord.js");

const Kit = require("../models/kit");
const Link = require("../models/link");
const Order = require("../models/order");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("bulk")
    .setDescription("Places a bulk order")
    .addStringOption(option => option.setName("mc_username")
        .setDescription("The Minecraft username of the account you want the kits delivered to (leave blank to use your link)")
        .setRequired(false)),

    async execute(interaction, client) {
        let minecraftUsername = interaction.options.getString("mc_username");
        if (!minecraftUsername) {
            const link = await Link.findOne({ discordUserId: interaction.user.id });
            if (!link) {
                return await interaction.reply({
                    content: "Unable to determine Minecraft username for delivery. Please create a link or specify a username.",
                    flags: MessageFlags.Ephemeral,
                });
            }

            minecraftUsername = link.minecraftUsername;
        }

        let inviteCount = 0;

        const invites = await interaction.guild.invites.fetch();
        invites.forEach((invite) => {
            if (invite.inviter.id === interaction.user.id) {
                inviteCount += invite.uses;
            }
        });

        if (inviteCount < global.config.orderBulkInviteRequirement) {
            return await interaction.reply({
                content: `You need to invite **${global.config.orderBulkInviteRequirement - inviteCount}** more people to this server to make a bulk order.`,
                flags: MessageFlags.Ephemeral,
            });
        }

        const lastBulkOrder = await Order.findOne({ discordGuildId: interaction.guild.id, discordUsername: interaction.user.username, bulk: true });
        if (lastBulkOrder && !lastBulkOrder.canceled) {
            return await interaction.reply({
                content: "You have already claimed your bulk order.",
                flags: MessageFlags.Ephemeral,
            });
        }

        const kit = await Kit.findOne({
            kitId: global.config.orderBulkKitId,
            discordGuildId: interaction.guild.id,
        });

        if (!kit.inStock) {
            return await interaction.reply({
                content: "Unfortunately, the bulk order kit is out of stock, please try again later.",
                flags: MessageFlags.Ephemeral,
            });
        }

        const kitIds = [];
        for (let i = 0; i < global.config.orderBulkKitCount; i++) {
            kitIds.push(kit.kitId);
        }

        const order = new Order({
            discordGuildId: interaction.guild.id,
            discordUsername: interaction.user.username,
            minecraftUsername: minecraftUsername,
            kitIds: kitIds,
            bulk: true,
        });

        await order.save();

        const embed = {
            title: "__Bulk Order Placed:__",
            description: "The account selected will be notified ingame on the status of the order.",
            color: 0xb78e60,
            footer: { text: "Nimrod Express" },
        };

        await interaction.reply({
            embeds: [embed],
            flags: MessageFlags.Ephemeral,
        });
    }
}
