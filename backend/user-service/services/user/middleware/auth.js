

const http = require('http');
const https = require('https');
const { URL } = require('url');

// // Utility: POST JSON to URL and parse JSON response
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

// Utility: GET JSON safely
function getJson(targetUrl, headers = {}) {
  return new Promise((resolve, reject) => {
    try {
      const url = new URL(targetUrl);

      const options = {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname + url.search,
        method: 'GET',
        headers,
      };

      const client = url.protocol === 'https:' ? https : http;

      const req = client.request(options, (res) => {
        let rawData = '';

        res.on('data', (chunk) => {
          rawData += chunk;
        });

        res.on('end', () => {
          try {
            const contentType = res.headers['content-type'] || '';

            let parsed = {};

            if (contentType.includes('application/json')) {
              parsed = rawData ? JSON.parse(rawData) : {};
            }

            if (res.statusCode >= 200 && res.statusCode < 300) {
              return resolve(parsed);
            }

            return reject({
              statusCode: res.statusCode,
              body: parsed || rawData,
            });

          } catch (parseError) {
            return reject(parseError);
          }
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      req.end();

    } catch (err) {
      reject(err);
    }
  });
}

module.exports = async function authMiddleware(req, res, next) {

  try {

    // Safety check
    if (typeof next !== 'function') {
      console.error('next is not a function');
      return res.status(500).json({
        code: 'ERR_SERVER',
        message: 'Middleware configuration error'
      });
    }

    // const authHeader =
    //   req.headers.authorization ||
    //   req.headers.Authorization;
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      return res.status(401).json({
        code: 'ERR_UNAUTHORIZED',
        message: 'Missing token'
      });
    }

    // Extract token
    let token = authHeader;

    if (
      typeof authHeader === 'string' &&
      authHeader.toLowerCase().startsWith('bearer ')
    ) {
      token = authHeader.slice(7).trim();
    }

    // External auth service validation
    const validateUrl = process.env.AUTH_VALIDATE_URL;

    if (validateUrl) {

      try {

        const response = await getJson(validateUrl, {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        });

        const { getHierarchyLevel, getDefaultPermissions } = require('../utils/rbacHelpers');
        const role = response.role || 'STUDENT';
        const roleType = response.roleType || null;
        req.user = {
          user_id: response.user_id || response.id || response.sub,
          role: role,
          roleType: roleType,
          permissions: (response.permissions && response.permissions.length > 0)
            ? response.permissions
            : getDefaultPermissions(role, roleType),
          hierarchyLevel: (response.hierarchyLevel !== undefined && response.hierarchyLevel !== null)
            ? response.hierarchyLevel
            : getHierarchyLevel(role),
          is_active: response.is_active !== false
        };

        return next();

      } catch (err) {

        console.error('Auth validation failed:', err);

        return res.status(401).json({
          code: 'ERR_UNAUTHORIZED',
          message: 'Invalid token'
        });
      }
    }

    // JWT fallback mode
    try {

      const jwt = require('jsonwebtoken');

      const decoded = jwt.decode(token);

      if (!decoded) {
        return res.status(401).json({
          code: 'ERR_UNAUTHORIZED',
          message: 'Invalid token'
        });
      }

      const { getHierarchyLevel, getDefaultPermissions } = require('../utils/rbacHelpers');
      const role = decoded.role || 'STUDENT';
      const roleType = decoded.roleType || null;
      req.user = {
        user_id: decoded.user_id || decoded.sub || decoded.id,
        role: role,
        roleType: roleType,
        permissions: (decoded.permissions && decoded.permissions.length > 0)
          ? decoded.permissions
          : getDefaultPermissions(role, roleType),
        hierarchyLevel: (decoded.hierarchyLevel !== undefined && decoded.hierarchyLevel !== null)
          ? decoded.hierarchyLevel
          : getHierarchyLevel(role),
        is_active: decoded.is_active !== false
      };

      console.log('Fallback JWT User:', req.user);

      return next();

    } catch (jwtError) {

      console.error(jwtError);

      return res.status(401).json({
        code: 'ERR_UNAUTHORIZED',
        message: 'Token validation unavailable'
      });
    }

  } catch (err) {

    console.error('Auth Middleware Error:', err);

    return res.status(500).json({
      code: 'ERR_SERVER',
      message: 'Internal server error'
    });
  }
};

