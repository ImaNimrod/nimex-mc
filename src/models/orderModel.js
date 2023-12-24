const orders = [];

class Order {
    constructor(discordUsername, minecraftUsername, kits) {
        this.discordUsername = discordUsername;
        this.minecraftUsername = minecraftUsername;
        this.kits = kits;
    }
}

const getNextOrder = () => {
    return orders.shift();
};

const listOrders = () => {
    return orders;
}

const placeOrder = (order) => {
    orders.push(order);
}

module.exports = {
    Order,
    getNextOrder,
    listOrders,
    placeOrder,
};
