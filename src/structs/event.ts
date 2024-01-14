import Deliverer from "../deliverer";

export default abstract class Event {
    readonly client: Deliverer;
    name: string = "";
    once: boolean = false;

    constructor(client: Deliverer) {
        this.client = client;
    }

    abstract execute(...args: any[]): any;
}
