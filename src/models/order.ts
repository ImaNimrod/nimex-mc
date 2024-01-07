export class Order {
    constructor(public readonly discordUsername: string,
                public readonly minecraftUsername: string,
                public readonly kits: string[]) {}
}

const orders: Order[] = [];

export function getNextOrder(): Order | null {
    if (orders.length > 0) return orders.shift()!;
    else return null;
}

export function getOrders(): Order[] {
    return orders;
}

export function placeOrder(order: Order) {
    orders.push(order);
}
