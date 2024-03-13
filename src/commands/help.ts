import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

import Command from "../structs/command";

export default class Help extends Command {
    name = "help";
    description = "Displays helpful information about the Nimrod Express";

    async execute(interaction: ChatInputCommandInteraction) {
        const embed = new EmbedBuilder()
        .setTitle("__Help:__")
        .setDescription("__**What is the Nimrod Express?**__A **fully automated** kit delivery system that (ab)uses 6b6t's TPA functionality.\n\n__**How do I use it?**__\n 1. Before placing an order you should use **/list_kits** to view all of the kits that are currently in stock.\n2. Then, use **/order** to order up to **4 kits** at one time. Note that you can order any combination of kits at once. Remember that the bot will **verify the player with the Minecraft username you entered is online**.\n3. When the bot begins processing your order, you (or the player you chose) will be notified through a **whisper in chat** that the order is out for delivery\n4. The player will then be sent a **TPA request** from the bot. Please **accept the request** in a timely manner. If the bot's TPA request times out, your order will be discarded completely.\n5. Once the bot TPAs to you, **kill it** to receive your order. **It will not drop the kits on its own!** Remember to **PLEASE be polite** when using the bot; other people count on it too!\n\n__**It's not working!**__\nThis is a *very* new system, so it is bound to have some bugs. **Bear with us!** We promise we are doing our best! Also, remember that your order could take a while to be delivered due to TPA cooldown, lag, and various other factors. Please message **ImaNimrod (QuantumPapaya)** if you believe you have found a bug. Also, monitor the **announcements channel** for updates on the status of the **Nimrod Express**\n\n__**Further Questions?**__\n - Use common sense.\n- If you are still stuck, message **ImaNimrod (QuantumPapaya)** or another member of the kit delivery team.")
        .setColor(0xb78e60)
        .setTimestamp()
        .setFooter({ text: "Nimrod Express" });

        await interaction.reply({
            embeds: [embed],
            ephemeral: true,
        });
    }
}
