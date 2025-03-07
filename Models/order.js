const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
    orderID: String,
    products: [
        {
            productID: String,
            quantity: Number,
        },
    ],
    orderWorth: Number,
});

module.exports = mongoose.model("Order", OrderSchema);
