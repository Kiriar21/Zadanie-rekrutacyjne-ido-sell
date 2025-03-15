require("dotenv").config();

module.exports = {
    API_URL: "https://zooart6.yourtechnicaldomain.com/api/admin/v5/orders/orders",
    API_KEY: "hash",
    DB_URI: "mongodb://localhost:27017/ordersDB",
    CRON_SCHEDULE: "0 0 * * *", 
    BASIC_AUTH_USER: "admin",
    BASIC_AUTH_PASS: "password123"
};