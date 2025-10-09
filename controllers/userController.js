import pool from '../dbConnect.js';

export const getUsers = async (req, res, next) => {
  try {
    const users = await pool.query('SELECT user_id, username, email, role, created_at FROM users');
    res.json(users.rows);
  } catch (err) {
    next(err);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    await pool.query('UPDATE users SET role = $1 WHERE user_id = $2', [role, userId]);
    res.json({ message: 'Role updated' });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    await pool.query('DELETE FROM users WHERE user_id = $1', [userId]);
    res.json({ message: 'User deleted' });
  } catch (err) {
    next(err);
  }
};