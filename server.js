const express = require("express");
const cors = require("cors");
require("dotenv").config();
const pool = require("./db");
//require("./cron/dailyCreditReport");
//require("./cron/lowCreditAlert");
//require("./cron/zeroCreditAlert");
require("./cron/sendScheduledReplies");
require("./cron/checkNewNotifications");

const app = express();
app.use(cors());
app.use(express.json());

const userRoutes = require("./routes/users");
app.use("/api/users", userRoutes);

const ordersRoutes = require("./routes/orders");
app.use("/api/orders", ordersRoutes);

const ticketsRoutes = require("./routes/tickets");
app.use("/api/tickets", ticketsRoutes);

const paymentRoutes = require("./routes/payments");
app.use("/payment", paymentRoutes);

const usageRoutes = require("./routes/usage");
app.use("/api/usage", usageRoutes);

const creditBalanceRoutes = require("./routes/dashboard");
app.use("/api/credit-balance", creditBalanceRoutes);

const notificationsRoutes = require("./routes/notifications");
app.use("/api/notifications", notificationsRoutes);

const checkApiKey = require("./middleware/checkApiKey");
const apiService = require("./public_service/api");
app.use("/api/public/v1/", checkApiKey, apiService);

const { autoCloseInactiveTickets } = require("./utils/autoCloseTickets");
setInterval(autoCloseInactiveTickets, 60 * 60 * 1000); // every hour

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
