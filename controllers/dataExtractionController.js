import pool from '../dbConnect.js';
import { extractTextFromS3Image } from '../services/visionAIService.js';
import { classifyDocument } from '../services/documentClassificationService.js';
import { extractFieldsFromDocument } from "../services/documentAIService.js";

export const ocrDocument = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const bucket = process.env.S3_BUCKET_NAME; // or S3_BUCKET_NAME

    // Get document info from DB
    const result = await pool.query('SELECT file_name, user_id  FROM documents WHERE document_id = $1', [documentId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const { file_name, user_id: userId } = result.rows[0];
    const key = result.rows[0].file_name.replace(/^uploads\//, ''); // adjust if needed

    // Extract text
    const extractedText = await extractTextFromS3Image(bucket, key);
    console.log(typeof extractedText, extractedText);

    // Classify document using the extracted text
    const documentType = classifyDocument(extractedText);
    console.log('Detected document type:', documentType);
    
    // Save to DB
    await pool.query('UPDATE documents SET extracted_data = $1, document_type = $2 WHERE document_id = $3', [JSON.stringify({ content: extractedText }), documentType, documentId]);

    //  Field extraction using Google Document AI
    const projectId = process.env.GCLOUD_PROJECT_ID;
    const location = "us";
    const processorId = process.env.GCLOUD_DOC_AI_PROCESSOR_ID;

    let fields = { name: null, address: null, dob: null };
    try {
      fields = await extractFieldsFromDocument(bucket, key, processorId, projectId, location);
      console.log('Document AI fields:', fields);
    } catch (err) {
      console.error('Document AI extraction failed, continuing without structured fields:', err.message ?? err);
      // continue execution; extractedText and documentType already saved
    }

//  Insert into user_data table only if we have a user and at least one extracted field
    if (userId && (fields.name || fields.address || fields.dob)) {
      await pool.query(
        `INSERT INTO user_data (user_id, document_id, name, address, dob)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, documentId, fields.name, fields.address, fields.dob]
      );
      console.log(`Inserted user_data for userId: ${userId}`);
    } else {
      console.log('Skipping user_data insert: missing userId or no extracted fields');
    }

    // Return response
    res.status(200).json({
      message: 'OCR and classification completed successfully',
      documentId,
      documentType,
      fulltext: extractedText,
      extractedFields: fields,
    });
  } catch (err) {
    console.error('Error in OCR/classification:', err);
    next(err);
  }
};