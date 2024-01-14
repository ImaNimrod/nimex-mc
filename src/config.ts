import * as dotenv from "dotenv";

export default interface Config {
    discordPrivledgedRoleId: string,
    discordToken: string,
    minecraftUsername: string,
    minecraftPassword: string,
    mongodbURI: string,
}

export function loadFromEnv(): Config {
    dotenv.config();

    return {
        discordPrivledgedRoleId: process.env.DISCORD_PRIVLEDGED_ROLE_ID!,
        discordToken: process.env.DISCORD_TOKEN!,
        minecraftUsername: process.env.MINECRAFT_USERNAME!,
        minecraftPassword: process.env.MINECRAFT_PASSWORD!,
        mongodbURI: process.env.MONGODB_URI!,
    };
}

