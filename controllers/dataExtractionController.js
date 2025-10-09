import pool from '../dbConnect.js';
import { extractTextFromS3Image } from '../services/visionAIService.js';
import { classifyDocument } from '../services/documentClassificationService.js';

export const ocrDocument = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const bucket = process.env.S3_BUCKET_NAME; // or S3_BUCKET_NAME

    // Get document info from DB
    const result = await pool.query('SELECT file_name FROM documents WHERE document_id = $1', [documentId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Document not found' });
    }
    const key = result.rows[0].file_name.replace(/^uploads\//, ''); // adjust if needed

    // Extract text
    const extractedText = await extractTextFromS3Image(bucket, key);
    console.log(typeof extractedText, extractedText);

    // Classify document using the extracted text
    const documentType = classifyDocument(extractedText);
    console.log('Detected document type:', documentType);
    
    // Save to DB
    await pool.query('UPDATE documents SET extracted_data = $1, document_type = $2 WHERE document_id = $3', [JSON.stringify({ content: extractedText }), documentType, documentId]);

    // Return response
    res.status(200).json({
      message: 'OCR and classification completed successfully',
      documentId,
      documentType,
      extractedText,
    });
  } catch (err) {
    console.error('Error in OCR/classification:', err);
    next(err);
  }
};