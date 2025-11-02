import express from 'express';
import { ocrDocument } from '../controllers/dataExtractionController.js';
import { protect,customerOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/:documentId/ocr', protect, customerOnly, ocrDocument);

export default router;