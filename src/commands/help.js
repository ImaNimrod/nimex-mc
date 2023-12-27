const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Displays helpful information about how to use Nimrod Express"),

    async execute(interaction, client) {
        const embed = {
            title: "__Help:__",
            description: "__**What is the Nimrod Express?**__\nA **fully automated** kit delivery system that (ab)uses 6b6t's TPA functionality.\n\n__**How do I use it?**__\n 1. Before placing an order you should use **/list_kits** to view all of the kits that are currently in stock.\n2. Then, use **/order** to order up to **4 kits** at one time. Note that you can order any combination of kits at once. Remember that the bot will **verify the player with the Minecraft username you entered is online**; if not, it puts your order into the back of the queue.\n3. When the bot begins processing your order, you (or the player you chose) will be notified through a **whisper in chat** that the order is out for delivery\n4. The player will then be sent a **TPA request** from the bot. Please **accept the request** in a timely manner. If the bot's TPA requests timeout **3 times**, your order will be discarded completely.\n5. Once the bot TPAs to you, **kill it** to receive your order. **It will not drop the kits on its own!** Remember to **PLEASE be polite** when using the bot; other people count on it too!\n\n__**It's not working!**__\nThis is a *very* new system, so it is bound to have some bugs. **Bear with us!** We promise we are doing our best! Please message **ImaNimrod (QuantumPapaya)** if you believe you have found a bug. Also, monitor the **announcements channel** for updates on the status of the **Nimrod Express**\n\n__**Further Questions?**__\n - Use common sense.\n- If you are still stuck, message **ImaNimrod (QuantumPapaya)** or another member of the kit delivery team.",
            color: 0xb78e60,
            footer: { text: "Nimrod Express" },
        };

        const embeds = [embed]
        
        const privledgedRole = await interaction.guild.roles.fetch(process.env.DISCORD_PRIVLEDGED_ROLE_ID.toString());
        if (interaction.member.roles.cache.has(privledgedRole.id)) {
            const privledgedEmbed = {
                title: "__Kit Deliverer Reference:__",
                description: "__**What is my role in all of this?**__\nA kit deliverer **manages the kit stock**, as well as the **delivery bot's station** ingame. They also must be prepared to address client's questions and concerns. There is a number of commands that can only be accessed by kit deliverers.\n\n__**/add_kit:**__\n This command **adds a new kit to stock**. It takes a display name, description, and a kit ID as arguments. **Note that the kit ID must match the exact (case-sensitive, etc.) ingame name of the desired shulker box.** Also, your description argument should provide a short and effective summary of what is in your kit.\n\n__**/delete_kit:**__\nThis command **deletes a kit from stock**, and its only argument is the display name of the kit to be deleted.\n\n__**/list_orders:**__\nThis command **lists all pending orders** (Orders that have not been serviced yet). It lists the order's username, Minecraft recipient, and the kit IDs of the kits the user ordered.\n\n__**update_stock:**__\nThis command **updates whether an item is in stock or not**. It takes the display name of the kit and the new stock state as arguments. This command should only be after restocking a kit that the bot determined as out of stock.\n\n__**Conclusion:**__\nIf you are able to read this message, you have a very important job to do. Kit delivery to new friends and old friends alike is **at the heart of what we do here**. Do your best to keep clients happy throughout the whole ordering process, as you never know when you could be helping a future clan-member.",
                color: 0xb78e60,
                footer: { text: "Nimrod Express" },
            };

            embeds.push(privledgedEmbed);
        }

        await interaction.reply({
            embeds: embeds,
            ephemeral: true,
        });
    }
}
