const { createProxyMiddleware } = require('http-proxy-middleware');

/**
 * Creates a proxy middleware to forward requests to a specific service.
 * @param {string} targetUrl - The target base URL.
 * @returns {Function} Express middleware
 */
const createServiceProxy = (targetUrl) => {
  return createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
    timeout: 10000, // 10 seconds timeout
    proxyTimeout: 10000,
    pathRewrite: (path, req) => {
      // Typically, downstream modules handle their own base paths,
      // but if we need to rewrite `/v1/users` to `/users`, it can be done here.
      // For now, we forward the exact path so `/v1/users` becomes `targetUrl/v1/users`
      // Assuming modules expect the `/v1/...` prefix.
      return path; 
    },
    onProxyReq: (proxyReq, req, res) => {
      // Forward headers explicitly if needed.
      // x-user-id and x-user-role are already set on req.headers by authMiddleware
      if (req.headers['x-user-id']) {
        proxyReq.setHeader('x-user-id', req.headers['x-user-id']);
      }
      if (req.headers['x-user-role']) {
        proxyReq.setHeader('x-user-role', req.headers['x-user-role']);
      }
      if (req.traceId) {
        proxyReq.setHeader('x-trace-id', req.traceId);
      }
    },
    onError: (err, req, res) => {
      console.error(`[Proxy Error] TraceID: ${req.traceId} - Target: ${targetUrl}`, err.message);
      res.status(502).json({
        status: 'error',
        message: 'Bad Gateway: The downstream service is unavailable or did not respond in time.',
        traceId: req.traceId
      });
    }
  });
};

module.exports = createServiceProxy;
