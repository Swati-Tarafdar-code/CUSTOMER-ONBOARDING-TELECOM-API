import express from 'express';
import { getUsers, updateUserRole, deleteUser } from '../controllers/userController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, adminOnly, getUsers);
router.put('/:userId/role', protect, adminOnly, updateUserRole);
router.delete('/:userId', protect, adminOnly, deleteUser);

export default router;