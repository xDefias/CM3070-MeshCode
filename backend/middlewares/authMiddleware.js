const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

function authMiddleware(req, res, next) {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).json({ success: false, data: {}, error: 'Access denied. No token provided.' });
  }

  const token = authHeader.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ success: false, data: {}, error: 'Invalid token format.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    req.session.userId = decoded.id; // Ensure the userId is set in the session
    next();
  } catch (ex) {
    res.status(400).json({ success: false, data: {}, error: 'Invalid token.' });
  }
}

module.exports = authMiddleware;
