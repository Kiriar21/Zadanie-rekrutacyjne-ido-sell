const fs = require("fs");
const path = require("path");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

async function createCsv(orders) {
    const dirPath = path.join(__dirname, "../exports");
    const filePath = path.join(dirPath, "orders.csv");

    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    const csvWriter = createCsvWriter({
        path: filePath,
        header: [
            { id: "orderID", title: "Order ID" },
            { id: "orderWorth", title: "Order Worth" },
            { id: "products", title: "Products" },
        ],
    });

    const records = orders.map(order => ({
        orderID: order.orderID,
        orderWorth: order.orderWorth,
        products: order.products.map(p => `${p.productID} (${p.quantity})`).join(", "),
    }));

    await csvWriter.writeRecords(records);
    return filePath;
}

module.exports = { createCsv };
