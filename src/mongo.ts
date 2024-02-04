import { Collection, Db, MongoClient } from "mongodb";

import Config from "./config";
import KitModel from "./models/kit";
import OrderModel from "./models/order";

export interface Collections {
    kits: Collection<KitModel>,
    orders: Collection<OrderModel>,
};

let collections: Collections;

export async function connectToDatabase(config: Config) {
    const client: MongoClient = new MongoClient(config.mongodbURI);
    await client.connect();

    const db: Db = client.db("nimex");

    collections = {
        kits: db.collection<KitModel>("kits")!,
        orders: db.collection<OrderModel>("orders")!,
    }

    console.log("sucessfully connected to mongodb database");
}

export function getCollections(): Collections {
    return collections;
}
