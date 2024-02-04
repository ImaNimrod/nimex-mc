import { ObjectId } from "mongodb";

export default interface OrderModel {
    id?: ObjectId,
    discordUsername: string,
    minecraftUsername: string,
    kitIds: string[],
    delivered: boolean,
    createdAt: Date,
    deliveredAt?: Date,
}
