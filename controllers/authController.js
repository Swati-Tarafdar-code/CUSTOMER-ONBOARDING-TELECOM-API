import pool from '../dbConnect.js'; // Note the .js extension, often needed in Node ES Modules
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

//  Register new user
export const registerUser = async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;

    // Check if user exists
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, role)
       VALUES ($1, $2, $3, $4) RETURNING user_id, username, email, role, created_at`,
      [username, email, hashedPassword, role || 'customer']
    );

    const user = result.rows[0];

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token: generateToken(user.user_id, user.role),
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

//  Login user
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    res.json({
      message: 'Login successful',
      token: generateToken(user.user_id, user.role),
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// Get current logged-in user
export const getMe = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT user_id, username, email, role, created_at FROM users WHERE user_id = $1',
      [req.user.user_id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    next(err);
  }
};