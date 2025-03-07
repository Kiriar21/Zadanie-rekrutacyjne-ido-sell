const express = require("express");
const Order = require("../Models/order");
const auth = require("../middleware/auth");
const { createCsv } = require("../services/csvService");
const fetchOrders = require("../services/fetchOrders");

const router = express.Router();

router.post("/fetch", auth, async (req, res) => {
    try {
        await fetchOrders();
        res.json({ message: "✅ Zamówienia zostały pobrane i zapisane do bazy." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.get("/", auth, async (req, res) => {
    const { minWorth, maxWorth } = req.query;
    let filter = {};

    if (minWorth) filter.orderWorth = { $gte: parseFloat(minWorth) };
    if (maxWorth) filter.orderWorth = { ...filter.orderWorth, $lte: parseFloat(maxWorth) };

    const orders = await Order.find(filter);
    res.json(orders);
});

router.get("/:id", auth, async (req, res) => {
    const order = await Order.findOne({ orderID: req.params.id });
    if (!order) return res.status(404).json({ message: "Zamówienie nie znalezione" });

    res.json(order);
});

router.get("/export/csv", auth, async (req, res) => {
    const orders = await Order.find();
    const csvFile = await createCsv(orders);

    res.download(csvFile);
});

module.exports = router;
