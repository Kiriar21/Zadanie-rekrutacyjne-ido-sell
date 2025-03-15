const axios = require("axios");
const Order = require("../Models/order");
const config = require("../config");

async function fetchOrders() {
    try {
        console.log("🔹 Pobieranie zamówień z IdoSell API...");

        let currentPage = 1;
        let totalPages = 1;

        while (currentPage <= totalPages) {
            console.log(`🔹 Pobieranie zamówień z strony ${currentPage}...`);

            const url = `${config.API_URL}?resultsPage=${currentPage}`;
            const response = await axios.get(url, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-KEY': config.API_KEY
                }
            });

            const results = response.data?.Results;
            if (!results || results.length === 0) {
                console.log(`❌ Brak zamówień na stronie ${currentPage}.`);
                break;
            }

            if (currentPage === 1) {
                const totalOrders = response.data.resultsNumberAll;
                const resultsPerPage = results.length;
                totalPages = Math.ceil(totalOrders / resultsPerPage);
                console.log(`🔹 Znalazłem ${totalOrders} zamówień, podzielonych na ${totalPages} stron.`);
            }

            for (const order of results) {
                const products = Array.isArray(order.orderDetails?.productsResults)
                    ? order.orderDetails.productsResults.map(prod => ({
                          productID: prod.productId,
                          quantity: prod.productQuantity,
                      })).sort((a, b) => a.productID - b.productID) // Sortowanie produktów
                    : [];

                const newOrderData = {
                    orderID: order.orderSerialNumber,
                    products: products,
                    orderWorth: parseFloat(order.orderDetails?.payments?.orderCurrency?.orderProductsCost) || 0,
                };

                const existingOrder = await Order.findOne({ orderID: newOrderData.orderID });

                if (!existingOrder) {
                    console.log(`➕ Dodanie nowego zamówienia ${newOrderData.orderID}.`);
                    await Order.create(newOrderData);
                } else {
                    const existingOrderData = {
                        orderID: existingOrder.orderID,
                        products: existingOrder.products.sort((a, b) => a.productID - b.productID), // Sortowanie dla porównania
                        orderWorth: parseFloat(existingOrder.orderWorth),
                    };

                    if (
                        JSON.stringify(existingOrderData.products) !== JSON.stringify(newOrderData.products) ||
                        existingOrderData.orderWorth !== newOrderData.orderWorth
                    ) {
                        console.log(`✏️ Aktualizacja zmienionego zamówienia ${newOrderData.orderID}.`);
                        await Order.updateOne({ orderID: newOrderData.orderID }, { $set: newOrderData });
                    }
                }
            }

            console.log(`✅ Zamówienia z strony ${currentPage} zapisane w bazie.`);
            currentPage++;
        }

        console.log("✅ Wszystkie zamówienia zostały zapisane.");
    } catch (error) {
        console.error("❌ Błąd podczas pobierania zamówień:", error.message);
    }
}

module.exports = fetchOrders;
