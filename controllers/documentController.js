// // controllers/documentController.js

import fs from "fs";
import path from "path";
import pool from "../dbConnect.js";
import { logAction } from "./auditController.js";
import { uploadFileToS3 } from "../services/s3Upload.js";

// Upload Document
export const uploadDocument = async (req, res, next) => {
  try {
    const { user_id } = req.user; // Set by auth middleware

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = req.file;
    const filePath = path.resolve(file.path);
    const fileName = `${Date.now()}-${file.originalname}`;

    // Upload to S3
    const fileUrl = await uploadFileToS3(filePath, fileName, file.mimetype);

    // Delete temp file after upload
    fs.unlinkSync(filePath);

    // Insert document record (no status column here)
    const result = await pool.query(
      `INSERT INTO documents (user_id, file_name, file_path, document_type)
       VALUES ($1, $2, $3, 'UNKNOWN')
       RETURNING document_id`,
      [user_id, fileName, fileUrl]
    );

    const documentId = result.rows[0].document_id;

    // Update user status to PENDING_REVIEW in users table
    await pool.query(
      `UPDATE users SET status = $1 WHERE user_id = $2`,
      ['PENDING_REVIEW', user_id]
    );

    // Log upload action
    await logAction(user_id, documentId, "UPLOAD", { filename: fileName });

    res.status(201).json({
      message: "File uploaded successfully",
      documentId,
      fileUrl,
    });
  } catch (err) {
    next(err);
  }
};

// Review Document
export const reviewDocument = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const { status } = req.body; // e.g. 'APPROVED' or 'REJECTED'
    const reviewerId = req.user.user_id;

    // Get the user_id linked to this document
    const docResult = await pool.query(
      `SELECT user_id FROM documents WHERE document_id = $1`,
      [documentId]
    );

    if (docResult.rowCount === 0) {
      return res.status(404).json({ error: "Document not found" });
    }

    const userId = docResult.rows[0].user_id;

    // Update the status in users table
    await pool.query(
      `UPDATE users SET status = $1 WHERE user_id = $2`,
      [status, userId]
    );

    // Log review action
    await logAction(reviewerId, documentId, "REVIEW", { status });

    res.json({ message: "Document reviewed successfully", status });
  } catch (err) {
    next(err);
  }
};

