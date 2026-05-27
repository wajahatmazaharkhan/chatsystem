const express = require("express");
const mongoose = require("mongoose");

const chatRoutes =
  require("./routes/chatRoutes");

const statusRoutes =
  require("./routes/statusRoutes");

const analyticsRoutes =
  require("./routes/analyticsRoutes");

const app = express();

/*
==================================================
MIDDLEWARE
==================================================
*/

app.use(express.json());

/*
==================================================
ROUTES
==================================================
*/

app.use("/api/messages", chatRoutes);

app.use("/status", statusRoutes);

app.use("/analytics", analyticsRoutes);

/*
==================================================
DATABASE CONNECTION
==================================================
*/
require('dotenv').config();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://riya:riyarani@cluster0.rkwgi47.mongodb.net/chatdb?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
.then(() => {
  console.log("DB connected");
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})
.catch((err) => {
  console.log("DB connection error:", err);
});