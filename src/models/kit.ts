import { ObjectId } from "mongodb";

export default class Kit {
    constructor(
        public name: string,
        public description: string,
        public kitId: string,
        public inStock: boolean,
        public createdAt: Date,
        public id?: ObjectId) {}
}
