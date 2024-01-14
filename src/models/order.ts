export class Order {
    constructor(
        public readonly discordUsername: string,
        public readonly minecraftUsername: string,
        public readonly kits: string[]) {}
}

const orders: Order[] = [];

export function getNextOrder(): Order | undefined {
    return orders.shift();
}

export function getOrders(): Order[] {
    return orders;
}

export function placeOrder(order: Order) {
    orders.push(order);
}
