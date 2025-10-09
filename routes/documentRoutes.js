import upload from '../middleware/upload.js';
import express from 'express';
import multer from 'multer';
import { uploadDocument, reviewDocument } from '../controllers/documentController.js';
import { uploadService } from "../services/s3Upload.js";
import { protect } from '../middleware/authMiddleware.js';
const router = express.Router();

// const upload = multer({ dest: 'uploads/' });

router.post('/upload', protect, uploadService, uploadDocument);
router.put('/:documentId/review', protect, reviewDocument);

export default router;