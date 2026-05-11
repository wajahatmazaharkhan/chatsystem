const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = require("./app");
const config = require("./config");

app.listen(config.port, () => {
  console.log(`API Gateway listening on port ${config.port}`);
});
