import pool from '../dbConnect.js';

// Insert log into DB
export const logAction = async (userId, documentId, action, details = {}) => {
  try {
    await pool.query(
      `INSERT INTO audit_log (user_id, document_id, action, details)
       VALUES ($1, $2, $3, $4)`,
      [userId, documentId, action, details]
    );
  } catch (err) {
    console.error('Audit log error:', err.message);
  }
};

// Admin fetch logs
export const getAuditLogs = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT a.*, u.username, d.file_name
       FROM audit_log a
       LEFT JOIN users u ON a.user_id = u.user_id
       LEFT JOIN documents d ON a.document_id = d.document_id
       ORDER BY a.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};