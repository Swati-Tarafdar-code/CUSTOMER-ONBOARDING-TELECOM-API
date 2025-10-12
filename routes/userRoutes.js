import express from 'express';
import { getUsers, updateUserRole, deleteUser, getPendingUsers, getUserDetails, updateUserStatus  } from '../controllers/userController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, adminOnly, getUsers);
router.put('/:userId/role', protect, adminOnly, updateUserRole);
router.delete('/:userId/delete', protect, adminOnly, deleteUser);
router.get('/pending', protect, adminOnly, getPendingUsers);         //  Get pending users
router.get('/:userId/details', protect, getUserDetails);  // Get detailed info for one user
router.put('/:userId/status', protect, adminOnly, updateUserStatus); // Update status (Approved/Rejected)

export default router;