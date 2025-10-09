import vision from '@google-cloud/vision';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import stream from 'stream';
import { promisify } from 'util';

const client = new vision.ImageAnnotatorClient();
const s3 = new S3Client({ region: process.env.AWS_REGION });

const streamToBuffer = async (readStream) => {
  const chunks = [];
  for await (const chunk of readStream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
};

export const extractTextFromS3Image = async (bucket, key) => {
  try {
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    const response = await s3.send(command);
    const buffer = await streamToBuffer(response.Body);

    const [result] = await client.documentTextDetection({ image: { content: buffer } });
    return result.fullTextAnnotation?.text || '';
  } catch (err) {
    console.error('Vision API Error:', err);
    throw new Error('OCR failed');
  }
};