function calculateTotal(items) {
    let total = 0;

    for (const item of items) {
        total += item.price * item.quantity;
    }

    return total;
}

module.exports.calculateTotal = calculateTotal;