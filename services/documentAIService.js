import { DocumentProcessorServiceClient } from "@google-cloud/documentai";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({ region: process.env.AWS_REGION });
const client = new DocumentProcessorServiceClient();

// 🔹 Reuse your same stream-to-buffer logic
const streamToBuffer = async (readStream) => {
  const chunks = [];
  for await (const chunk of readStream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
};

export const extractFieldsFromDocument = async (bucket, key, processorId, projectId, location) => {
  try {
    // 1️⃣ Get file from S3
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    const response = await s3.send(command);
    const buffer = await streamToBuffer(response.Body);

    // 2️⃣ Detect MIME type (simple heuristic)
    let mimeType = "application/pdf";
    if (key.endsWith(".jpg") || key.endsWith(".jpeg")) mimeType = "image/jpeg";
    else if (key.endsWith(".png")) mimeType = "image/png";

    // 3️⃣ Prepare base64 input for Document AI
    const encodedImage = buffer.toString("base64");

    // 4️⃣ Build processor resource name
    const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;

    // 5️⃣ Call Document AI
    const [result] = await client.processDocument({
      name,
      rawDocument: {
        content: encodedImage,
        mimeType,
      },
    });

    const { document } = result;

    // 6️⃣ Extract fields from entities
    const fields = { name: null, address: null, dob: null };

    if (document.entities && document.entities.length > 0) {
      for (const entity of document.entities) {
        const type = entity.type?.toLowerCase();
        const text = entity.mentionText?.trim();

        if (type?.includes("name") && !fields.name) fields.name = text;
        else if (type?.includes("address") && !fields.address) fields.address = text;
        else if (type?.includes("date_of_birth") || type?.includes("dob")) fields.dob = text;
      }
    }

    return fields;
  } catch (err) {
    console.error("Document AI Error:", err);
    throw new Error("Field extraction failed");
  }
};