require("dotenv").config();

const app = require("./src/app");

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Gateway running on port ${PORT}`);
});

if (app.socketProxy) {
  server.on('upgrade', app.socketProxy.upgrade);
}