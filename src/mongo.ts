import { Collection, Db, MongoClient } from "mongodb";

import Config from "./config";

export const collections: {
    kits?: Collection,
    // orders?: Collection,
} = {}

export default async function connectToDatabase(config: Config) {
    const client: MongoClient = new MongoClient(config.mongodbURI);
    await client.connect();

    const db: Db = client.db("nimex");

    collections.kits = db.collection("kits");
    // collections.orders = db.collection("orders");

    console.log("sucessfully connected to mongodb database");
}
