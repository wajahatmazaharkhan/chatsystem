const morgan = require('morgan');

// Custom format to include traceId
morgan.token('trace-id', (req) => {
  return req.traceId || '-';
});

const loggerFormat = ':trace-id :method :url :status :res[content-length] - :response-time ms';

const loggerMiddleware = morgan(loggerFormat);

module.exports = loggerMiddleware;
