const express = require('express');
const cors = require('cors');
const chatRoutes = require('./api/v1/routes/chatRoutes');
const groupRoutes = require('./api/v1/routes/groupRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/v1/chat', chatRoutes);
app.use('/v1/group', groupRoutes);

module.exports = app;