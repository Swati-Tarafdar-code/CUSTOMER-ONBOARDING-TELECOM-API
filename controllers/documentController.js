// controllers/documentController.js
import fs from "fs";
import path from "path";
import pool from "../dbConnect.js";
import { logAction } from "./auditController.js";
import { uploadFileToS3 } from "../services/s3Upload.js";

export const uploadDocument = async (req, res, next) => {
  try {
    const { user_id } = req.user; // Assuming authentication middleware sets req.user

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = req.file;
    const filePath = path.resolve(file.path);
    const fileName = `${Date.now()}-${file.originalname}`;

    // Upload to S3
    const fileUrl = await uploadFileToS3(filePath, fileName, file.mimetype);

    // Clean up temp file
    fs.unlinkSync(filePath);

    // Insert into database
    const result = await pool.query(
      `INSERT INTO documents (user_id, file_name, file_path, document_type, status)
       VALUES ($1, $2, $3, 'UNKNOWN', 'PENDING_REVIEW') RETURNING document_id`,
      [user_id, fileName, fileUrl]
    );

    const documentId = result.rows[0].document_id;

    // Log the action
    await logAction(user_id, documentId, "UPLOAD", { filename: fileName });

    res.status(201).json({
      message: "File uploaded successfully",
      documentId,
      fileUrl
    });
  } catch (err) {
    next(err);
  }
};

export const reviewDocument = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const { status } = req.body;

    await pool.query("UPDATE documents SET status = $1 WHERE document_id = $2", [
      status,
      documentId,
    ]);

    await logAction(req.user.user_id, documentId, "REVIEW", { status });

    res.json({ message: "Document reviewed" });
  } catch (err) {
    next(err);
  }
};





// import pool from '../dbConnect.js';
// import { logAction } from './auditController.js';

// export const uploadDocument = async (req, res, next) => {
//   try {
//     const { user_id } = req.user;
//     const filePath = req.file.path;
//     const fileName = req.file.filename;

//     const result = await pool.query(
//       `INSERT INTO documents (user_id, file_name, file_path, document_type, status)
//        VALUES ($1, $2, $3, 'Adhaar', 'PENDING_REVIEW') RETURNING document_id`,
//       [user_id, fileName, filePath]
//     );

//     const documentId = result.rows[0].document_id;

//     await logAction(user_id, documentId, 'UPLOAD', { filename: fileName });

//     res.status(201).json({ message: 'File uploaded', documentId });
//   } catch (err) {
//     next(err);
//   }
// };

// export const reviewDocument = async (req, res, next) => {
//   try {
//     const { documentId } = req.params;
//     const { status } = req.body;

//     await pool.query('UPDATE documents SET status = $1 WHERE document_id = $2', [
//       status,
//       documentId,
//     ]);
//     await logAction(req.user.user_id, documentId, 'REVIEW', { status });

//     res.json({ message: 'Document reviewed' });
//   } catch (err) {
//     next(err);
//   }
// };

