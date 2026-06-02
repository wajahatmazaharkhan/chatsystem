const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');

// Middlewares
const traceIdMiddleware = require('./middlewares/traceId');
const loggerMiddleware = require('./middlewares/logger');
const rateLimiter = require('./middlewares/rateLimiter');
const errorHandler = require('./middlewares/errorHandler');
const authMiddleware = require('./middlewares/auth.middleware');

// Swagger config
const swaggerDocument = require('./docs/swagger.json');

const app = express();

// 1. Trace ID - attached first so all logs have it
app.use(traceIdMiddleware);

// 2. Logging
app.use(loggerMiddleware);

// 3. Security headers & CORS
app.use(helmet());
app.use(cors());

// 4. Rate Limiting
app.use(rateLimiter);

// 5. Body Parsing
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// Swagger Documentation Route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Public Routes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API Gateway is healthy', timestamp: new Date() });
});

app.get('/gateway/status', (req, res) => {
  res.status(200).json({ status: 'active', version: '1.0.0', uptime: process.uptime() });
});

// V1 API Routes
const v1Routes = require('./routes/v1');
app.use('/v1', v1Routes);

// For backwards compatibility, optionally mount on root
app.use('/', v1Routes);

// Global Error Handler (must be last middleware)
app.use(errorHandler);

module.exports = app;
