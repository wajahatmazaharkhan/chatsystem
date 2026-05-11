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

mongoose.connect(
  "mongodb+srv://riya:riyarani@cluster0.rkwgi47.mongodb.net/chatdb?retryWrites=true&w=majority"
)
.then(() => {

  console.log("DB connected");

  app.listen(3000, () => {

    console.log(
      "Server running on port 3000"
    );
  });

})
.catch((err) => {

  console.log(
    "DB connection error:",
    err
  );
});