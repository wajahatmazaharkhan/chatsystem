const express = require("express");
const mongoose = require("mongoose");

const chatRoutes = require("./routes/chatRoutes");

const app = express();

// middleware
app.use(express.json());

// routes
app.use("/api/messages", chatRoutes);

// MongoDB Atlas connection
mongoose.connect("mongodb+srv://riya:riyarani@cluster0.rkwgi47.mongodb.net/chatdb?retryWrites=true&w=majority")
  .then(() => {
    console.log("DB connected");

    app.listen(3000, () => {
      console.log("Server running on port 3000");
    });
  })
  .catch((err) => {
    console.log("DB connection error:", err);
  });