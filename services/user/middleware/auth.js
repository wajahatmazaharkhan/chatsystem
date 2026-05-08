const http = require('http');
const https = require('https');
const { URL } = require('url');

// Utility: POST JSON to URL and parse JSON response
function postJson(targetUrl, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(targetUrl);
    const data = JSON.stringify(body);
    const opts = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + (url.search || ''),
      method: 'POST',
      headers: Object.assign({ 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }, headers),
    };
    const lib = url.protocol === 'https:' ? https : http;
    const req = lib.request(opts, (res) => {
      let raw = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => (raw += chunk));
      res.on('end', () => {
        try {
          const parsed = raw ? JSON.parse(raw) : {};
          if (res.statusCode >= 200 && res.statusCode < 300) return resolve(parsed);
          const err = new Error('Auth service error');
          err.statusCode = res.statusCode;
          err.body = parsed;
          return reject(err);
        } catch (e) {
          return reject(e);
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

module.exports = async function authMiddleware(req, res, next) {
  try {
    const auth = req.headers.authorization || req.headers.Authorization;
    if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ code: 'ERR_UNAUTHORIZED', message: 'Missing Bearer token' });
    const token = auth.slice('Bearer '.length).trim();

    // Prefer external auth validation endpoint when configured
    const validateUrl = process.env.AUTH_VALIDATE_URL; // e.g. http://auth-service:3000/auth/validate
    if (validateUrl) {
      try {
        const resp = await postJson(validateUrl, { token }, { Accept: 'application/json' });
        // Expecting { user_id, role, is_active? }
        req.user = { user_id: resp.user_id || resp.id || resp.sub, role: resp.role || resp.roleName, is_active: typeof resp.is_active === 'boolean' ? resp.is_active : true };
        return next();
      } catch (err) {
        if (err && err.statusCode === 401) return res.status(401).json({ code: 'ERR_UNAUTHORIZED', message: 'Invalid token' });
        return next(err);
      }
    }

    // Fallback: decode JWT without verification to extract claims (development only)
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.decode(token);
      if (!decoded) return res.status(401).json({ code: 'ERR_UNAUTHORIZED', message: 'Invalid token' });
      req.user = { user_id: decoded.user_id || decoded.sub || decoded.id, role: decoded.role || decoded.roles || 'STUDENT', is_active: decoded.is_active !== false };
      return next();
    } catch (e) {
      return res.status(401).json({ code: 'ERR_UNAUTHORIZED', message: 'Token validation unavailable' });
    }
  } catch (err) {
    next(err);
  }
};
