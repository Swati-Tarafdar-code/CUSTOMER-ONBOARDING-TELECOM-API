import upload from '../middleware/upload.js';
import express from 'express';
import multer from 'multer';
import { uploadDocument, reviewDocument } from '../controllers/documentController.js';
import { uploadService } from "../services/s3Upload.js";
import { protect,customerOnly } from '../middleware/authMiddleware.js';
const router = express.Router();

// const upload = multer({ dest: 'uploads/' });

router.post('/upload', protect, customerOnly, uploadService, uploadDocument);
router.put('/:documentId/review', protect, customerOnly, reviewDocument);

export default router;