import express from 'express';
import { getAuditLogs } from '../controllers/auditController.js';
import { protect } from '../middleware/authMiddleware.js'; // your auth middleware

const router = express.Router();

// ✅ Only admins should see logs
router.get('/', protect, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view logs' });
    }
    await getAuditLogs(req, res, next);
  } catch (err) {
    next(err);
  }
});

export default router;