import express from 'express';
import { ocrDocument } from '../controllers/dataExtractionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/:documentId/ocr', protect, ocrDocument);

export default router;