import { ObjectId } from "mongodb";

export default interface KitModel {
    id?: ObjectId,
    name: string,
    description: string,
    kitId: string,
    inStock: boolean,
    createdAt: Date,
}
