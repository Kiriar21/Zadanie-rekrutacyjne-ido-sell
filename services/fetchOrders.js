const axios = require("axios");
const Order = require("../Models/order");
const config = require("../config");
const Math = require("math");

async function fetchOrders() {
    try {
        console.log("🔹 Pobieranie zamówień z IdoSell API...");

        
        const initialResponse = await axios.get(`${config.API_URL}`, {
            headers: {
                accept: 'application/json',
                'X-API-KEY': `${config.API_KEY}`
            }
        });

        if (!initialResponse.data || !initialResponse.data.Results || !initialResponse.data.resultsNumberAll) {
            console.error("❌ Brak zamówień w odpowiedzi API.");
            return;
        }

        const totalOrders = initialResponse.data.resultsNumberAll;
        const totalPages = Math.ceil(totalOrders / 100); 

        console.log(`🔹 Znalazłem ${totalOrders} zamówień, które są podzielone na ${totalPages} stron.`);

        
        for (let page = 1; page <= totalPages; page++) {
            console.log(`🔹 Pobieranie zamówień z strony ${page}...`);

            const response = await axios.get(`${config.API_URL}&page=${page}`, {
                headers: {
                    accept: 'application/json',
                    'X-API-KEY': `${config.API_KEY}`
                }
            });

            if (!response.data || !response.data.Results) {
                console.error("❌ Brak zamówień w odpowiedzi API.");
                continue; 
            }

            const ordersData = response.data.Results.map(order => {
                const products = Array.isArray(order.orderDetails.productsResults) ? order.orderDetails.productsResults.map(prod => ({
                    productID: prod.productId, 
                    quantity: prod.productQuantity,   
                })) : [];

                return {
                    orderID: order.orderSerialNumber,  
                    products: products,      
                    orderWorth: order.orderDetails.payments.orderCurrency.orderProductsCost,  
                };
            });

            
            for (const order of ordersData) {
                const existingOrder = await Order.findOne({ orderID: order.orderID });

                if (existingOrder) {
                    
                    if (JSON.stringify(existingOrder.products) !== JSON.stringify(order.products) || existingOrder.orderWorth !== order.orderWorth) {
                        await Order.updateOne({ orderID: order.orderID }, { $set: order });
                    } 
                } else {
                    
                    console.log(`➕ Dodanie nowego zamówienia ${order.orderID}.`);
                    await Order.create(order);
                }
            }

            console.log(`✅ Zamówienia z strony ${page} zapisane w bazie.`);
        }

        console.log("✅ Wszystkie zamówienia zapisane.");

    } catch (error) {
        console.error("❌ Błąd pobierania zamówień:", error.message);
    }
}

module.exports = fetchOrders;
