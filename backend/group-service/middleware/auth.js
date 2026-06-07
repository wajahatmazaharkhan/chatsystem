const axios = require('axios');

const authenticate = async (req, res, next) => {
  console.log(
  "AUTH_VALIDATE_URL =",
  process.env.AUTH_VALIDATE_URL
);
const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token missing' });
  }

  const token = authHeader.split(' ')[1];

  if (process.env.NODE_ENV === 'test' && token.endsWith('.mockToken')) {
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      req.user = payload;
      return next();
    } catch (e) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  }

  try {
    const response = await axios.get(process.env.AUTH_VALIDATE_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    req.user = response.data; // { user_id, role }
    next();
  }catch (err) {
  console.log(
    "AUTH VALIDATION ERROR:",
    err.response?.status,
    err.response?.data
  );

  return res.status(401).json({
    error: "Invalid or expired token",
  });
}
};

module.exports = authenticate;
