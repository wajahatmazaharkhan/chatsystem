const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const analyticsRoutes = require('./routes/analyticsRoutes');

app.use('/analytics', analyticsRoutes);

app.get('/', (req, res) => {
  res.send('Module 7 Analytics Backend Running');
});

const PORT = process.env.PORT || 5007;

app.listen(PORT, () => {
  console.log(`Analytics Service running on port ${PORT}`);
});
