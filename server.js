const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const chatRoutes = require("./routes/chatRoutes");

const app = express();

// middleware
app.use(express.json());

// routes
app.use("/api/messages", chatRoutes);
app.use("/v1/chat", chatRoutes);

// error handler
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR LOG:", err);
  res.status(500).json({ error: err.message });
});

// MongoDB connection & server startup (only if run directly)
if (require.main === module) {
  const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/chatsystem";
  mongoose.connect(mongoUri)
    .then(() => {
      console.log("DB connected");

      const PORT = process.env.PORT || 3000;
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.log("DB connection error:", err);
    });
}

module.exports = app;