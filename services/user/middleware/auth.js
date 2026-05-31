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
          const ct = (res.headers['content-type'] || '').toLowerCase();
          if (ct.includes('application/json')) {
            const parsed = raw ? JSON.parse(raw) : {};
            if (res.statusCode >= 200 && res.statusCode < 300) return resolve(parsed);
            const err = new Error('Auth service error');
            err.statusCode = res.statusCode;
            err.body = parsed;
            return reject(err);
          }
          // Non-JSON -> return raw on success, or error with body on failure
          if (res.statusCode >= 200 && res.statusCode < 300) return resolve({ raw: raw });
          const err = new Error('Auth service returned non-JSON');
          err.statusCode = res.statusCode;
          err.body = raw;
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

// Utility: GET JSON from URL and parse JSON response safely
function getJson(targetUrl, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(targetUrl);
    const opts = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + (url.search || ''),
      method: 'GET',
      headers: Object.assign({}, headers),
    };
    const lib = url.protocol === 'https:' ? https : http;
    const req = lib.request(opts, (res) => {
      let raw = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => (raw += chunk));
      res.on('end', () => {
        try {
          const ct = (res.headers['content-type'] || '').toLowerCase();
          if (ct.includes('application/json')) {
            const parsed = raw ? JSON.parse(raw) : {};
            if (res.statusCode >= 200 && res.statusCode < 300) return resolve(parsed);
            const err = new Error('Auth service error');
            err.statusCode = res.statusCode;
            err.body = parsed;
            return reject(err);
          }
          // Non-JSON response (HTML/error) -> return as text in error
          if (res.statusCode >= 200 && res.statusCode < 300) return resolve({ raw: raw });
          const err = new Error('Auth service returned non-JSON');
          err.statusCode = res.statusCode;
          err.body = raw;
          return reject(err);
        } catch (e) {
          return reject(e);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

module.exports = async function authMiddleware(req, res, next) {
  try {
    let auth = req.headers.authorization || req.headers.Authorization;
    if (!auth) return res.status(401).json({ code: 'ERR_UNAUTHORIZED', message: 'Missing token' });

    // Accept either 'Bearer <token>' or raw token in Authorization header
    let token;
    if (typeof auth === 'string' && auth.toLowerCase().startsWith('bearer ')) {
      token = auth.slice('Bearer '.length).trim();
    } else {
      token = String(auth).trim();
    }

    // Prefer external auth validation endpoint when configured
    const validateUrl = process.env.AUTH_VALIDATE_URL; // e.g. http://auth-service:3000/auth/validate
    if (validateUrl) {
      try {
        // call validate endpoint with GET and Authorization header
        const hdr = { Accept: 'application/json', Authorization: `Bearer ${token}` };
        const resp = await getJson(validateUrl, hdr);
        // Expecting { user_id, role, is_active? } or { raw: '...' }
        const userResp = resp.raw ? {} : resp;
        req.user = { user_id: userResp.user_id || userResp.id || userResp.sub, role: userResp.role || userResp.roleName, is_active: typeof userResp.is_active === 'boolean' ? userResp.is_active : true };
        console.log('authMiddleware user:', req.user);
        return next();
      } catch (err) {
        if (err && err.statusCode === 401) return res.status(401).json({ code: 'ERR_UNAUTHORIZED', message: 'Invalid token' });
        // If auth service returned non-JSON (HTML), provide a clearer error
        if (err && err.body && typeof err.body === 'string') {
          return res.status(502).json({ code: 'ERR_AUTH_GATEWAY', message: 'Auth service error', details: err.body.slice(0, 1000) });
        }
        return next(err);
      }
    }

    // Fallback: decode JWT without verification to extract claims (development only)
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.decode(token);
      if (!decoded) return res.status(401).json({ code: 'ERR_UNAUTHORIZED', message: 'Invalid token' });
      req.user = { user_id: decoded.user_id || decoded.sub || decoded.id, role: decoded.role || decoded.roles || 'STUDENT', is_active: decoded.is_active !== false };
      console.log('authMiddleware fallback user:', req.user);
      return next();
    } catch (e) {
      return res.status(401).json({ code: 'ERR_UNAUTHORIZED', message: 'Token validation unavailable' });
    }
  } catch (err) {
    next(err);
  }
};
