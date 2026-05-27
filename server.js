const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const chatRoutes = require("./routes/chatRoutes");
const statusRoutes = require("./routes/statusRoutes"); // ✅ Module 6 added

const app = express();

// middleware
app.use(express.json());
app.use(express.static('frontend/dist'));

// routes
app.use("/api/messages", chatRoutes);
app.use("/v1/status", statusRoutes);

// MongoDB Atlas connection
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("DB connected");
  })
  .catch((err) => {
    console.log("DB connection error:", err.message);
  });

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});