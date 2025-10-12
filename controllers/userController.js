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

  //  Get all users pending review
export const getPendingUsers = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT
          u.user_id,
          u.username,
          u.email,
          u.role,
          u.created_at,
          d.status
           FROM users u
              LEFT JOIN documents d ON u.user_id = d.user_id
              WHERE d.status = 'PENDING_REVIEW';
              `
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

// Get user details + extracted/classified document info
export const getUserDetails = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const query = `
              SELECT 
                u.user_id,
                u.username,
                u.email,
                u.role,
                u.created_at,
                d.document_id,
                d.document_type,
                d.file_path,
                d.extracted_data,
                d.status
              FROM users u
              LEFT JOIN documents d ON u.user_id = d.user_id
              WHERE u.user_id = $1;
    `;
    const result = await pool.query(query, [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Aggregate user info and documents
    const userInfo = {
      user_id: result.rows[0].user_id,
      username: result.rows[0].username,
      email: result.rows[0].email,
      role: result.rows[0].role,
      created_at: result.rows[0].created_at,
      documents: result.rows
        .filter(row => row.document_id !== null)
        .map(row => ({
          document_id: row.document_id,
          document_type: row.document_type,
          file_path: row.file_path,
          extracted_data: row.extracted_data,
          status: row.status
        }))
    };
    res.json(userInfo);
  } catch (err) {
    next(err);
  }
};

// Update user status (APPROVED or REJECTED)
export const updateUserStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { status } = req.body; // expected 'APPROVED' or 'REJECTED'

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    await pool.query('UPDATE documents SET status = $1 WHERE user_id = $2', [status, userId]);
    res.json({ message: `User status updated to ${status}` });
  } catch (err) {
    next(err);
  }
};