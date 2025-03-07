const cron = require("node-cron");
const fetchOrders = require("./services/fetchOrders");
const config = require("./config");

cron.schedule(config.CRON_SCHEDULE, () => {
    console.log("Uruchamiam pobieranie zamówień...");
    fetchOrders();
});

console.log("Cron job do pobierania zamówień uruchomiony.");
