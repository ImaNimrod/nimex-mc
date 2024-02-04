import * as dotenv from "dotenv";

export default interface Config {
    discordPrivledgedUsernames: string[],
    discordToken: string,
    minecraftUsername: string,
    minecraftPassword: string,
    mongodbURI: string,
    orderCooldown: number,
}

export function loadFromEnv(): Config {
    dotenv.config();

    return {
        discordPrivledgedUsernames: process.env.DISCORD_PRIVLEDGED_USERNAMES!.split(" "),
        discordToken: process.env.DISCORD_TOKEN!,
        minecraftUsername: process.env.MINECRAFT_USERNAME!,
        minecraftPassword: process.env.MINECRAFT_PASSWORD!,
        mongodbURI: process.env.MONGODB_URI!,
        orderCooldown: Number(process.env.ORDER_COOLDOWN!),
    };
}

