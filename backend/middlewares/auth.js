const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No bearer token passed' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const requireInstructor = (req, res, next) => {
  if (!req.user || req.user.role !== 'instructor') {
    return res.status(403).json({ error: 'Instructor only' });
  }
  next();
};

module.exports = { protect, requireInstructor };
