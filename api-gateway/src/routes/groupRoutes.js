const config = require("../config");
const { createProxyRouter } = require("../utils/proxyService");

module.exports = createProxyRouter(config.groupService, "Group");
