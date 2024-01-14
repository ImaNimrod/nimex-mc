import Config, { loadFromEnv } from "./config";
import Deliverer from "./deliverer";
import connectToDatabase from "./mongo";

const config: Config = loadFromEnv();

(async () => {
    await connectToDatabase(config);

    const bot: Deliverer = new Deliverer(config);
    bot.start();
})().catch(console.error);
