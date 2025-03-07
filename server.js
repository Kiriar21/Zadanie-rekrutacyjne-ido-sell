const express = require("express");
const mongoose = require("mongoose");
const config = require("./config");
const ordersRoutes = require("./routes/orders");
require("./cron");

const app = express();
app.use(express.json());

mongoose.connect(config.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

app.use("/api/orders", ordersRoutes);

app.listen(3000, () => console.log("Serwer działa na porcie 3000"));
