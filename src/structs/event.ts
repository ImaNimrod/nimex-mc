import Deliverer from "../deliverer";

export default abstract class Event {
    protected readonly client: Deliverer;
    name: string = "";
    once: boolean = false;

    protected constructor(client: Deliverer) {
        this.client = client;
    }

    abstract execute(...args: any[]): any;
}
