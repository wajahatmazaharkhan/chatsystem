const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const batchRoutes = require('./routes/batchRoutes');
const groupRoutes = require('./routes/groupRoutes');
const groupStructureRoutes = require('./routes/groupStructureRoutes');
const mockRoutes = require('./mocks/mockRoutes');

dotenv.config();
connectDB();

const app = express();
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());

app.use('/v1/batches', batchRoutes);
app.use('/v1/groups', groupRoutes);
app.use('/v1/group-structure', groupStructureRoutes)

if (process.env.NODE_ENV === 'development') {
  app.use('/mock/v1/groups', mockRoutes);
}

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => console.log(`Module 3 running on port ${PORT}`));
