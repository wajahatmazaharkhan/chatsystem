const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const chatRoutes = require("./routes/chatRoutes");

const app = express();

// middleware
app.use(express.json());

// routes
app.use("/api/messages", chatRoutes);

// MongoDB connection (ONLY THIS)
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("DB connected");

    app.listen(3000, () => {
      console.log("Server running on port 3000");
    });
  })
  .catch((err) => {
    console.log("DB connection error:", err);
  });