import { ObjectId } from "mongodb";

export default interface OrderModel {
    id?: ObjectId,
    discordGuildId: string,
    discordUsername: string,
    minecraftUsername: string,
    kitIds: string[],
    delivered: boolean,
    createdAt: Date,
    deliveredAt?: Date,
}
