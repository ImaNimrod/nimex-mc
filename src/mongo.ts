import { Collection, Db, MongoClient } from "mongodb";

export const collections: {
    kits?: Collection,
    orders?: Collection,
} = {}

export default async function connectToDatabase(uri: string, dbName: string) {
    const client: MongoClient = new MongoClient(uri);
    await client.connect();

    const db: Db = client.db(dbName);

    collections.kits = db.collection("kits");
    collections.orders = db.collection("orders");

    console.log("sucessfully connected to mongodb database");
}
