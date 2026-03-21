const { calculateTotal } = require("../utils/calculateTotal");

describe("Unit Test - calculateTotal", () => {
    test("Normal case", () => {
        const items = [
            { price: 100, quantity: 2 },
            { price: 50, quantity: 1 }
        ];
        expect(calculateTotal(items)).toBe(250);
    });
    test("Empty array", () => {
        const items = [];
        expect(calculateTotal(items)).toBe(0);
    });
    test("Quantity = 0", () => {
        const items = [
            { price: 100, quantity: 0 }
        ];
        expect(calculateTotal(items)).toBe(0);
    });
});