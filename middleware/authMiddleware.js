import jwt from 'jsonwebtoken';
import pool from '../dbConnect.js';

// Protect routes
export const protect = async (req, res, next) => {
  let token;
    if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded JWT:', decoded);
    const result = await pool.query('SELECT * FROM users WHERE user_id = $1', [decoded.id]);
    req.user = result.rows[0];
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: 'Not authorized' });
  }
};

// Admin check
export const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access only' });
  }
  next();
};