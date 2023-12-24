const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Displays helpful information about how to use Nimrod Express"),

    async execute(interaction, client) {
        const embed = {
            title: "__Help:__",
            description: "__**What is the Nimrod Express?**__\nA **fully automated** kit delivery system that (ab)uses 6b6t's TPA functionality.\n\n__**How do I use it?**__\n - Before placing an order you should use **/list_kits** to view all of the kits that are currently in stock.\n- You can then use **/order** to order up to **4 kits** at one time. Note that you can order any combination of kits at once. Remember, the bot will **verify that the player with the Minecraft username you entered is online**; if not, it puts your order into the back of the queue.\n- When the bot begins processing your order, the player you chose will be notified through a **whisper in chat** that the order is out for delivery\n- The player will then be sent a **TPA request** from the bot. Please **move to a safe area** and **accept the request** in a timely manner. If the bot's TPA requests timeout **3 times**, your order will be discarded completely.\n- Once the bot TPAs to you, **kill it** to receive your order. **It will not drop the kits on its own!** Remember to **PLEASE be polite** when using the bot; other people count on it too!\n\n__**It's not working!**__\nThis is a *very* new system, so it is bound to have some bugs. **Bear with us!** We promise we are doing our best! Please message **ImaNimrod (QuantumPapaya)** if you believe you have found a bug. Also, monitor the **announcements channel** for updates on the status of the **Nimrod Express**\n\n__**Further Questions?**__\n - Use common sense.\n- If you are still stuck, message **ImaNimrod (QuantumPapaya)** or another member of the kit delivery team.",
            color: 0xb78e60,
            footer: { text: "Nimrod Express" }
        };

        await interaction.reply({
            embeds: [embed],
            ephemeral: true
        });
    }
}
