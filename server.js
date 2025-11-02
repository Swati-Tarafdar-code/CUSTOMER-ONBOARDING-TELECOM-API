import express from 'express';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import dataExtractionRoutes from './routes/dataExtractionRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import fs from "fs";
import path from "path";
import os from "os";

if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
  // Decode Base64-encoded JSON from env var
  const decoded = Buffer.from(
    process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON,
    "base64"
  ).toString("utf-8");

  // Cross-platform temporary path
  const filePath = path.join(os.tmpdir(), "service-account.json");

  // Write credentials file
  fs.writeFileSync(filePath, decoded);

  // Point Google SDKs to it
  process.env.GOOGLE_APPLICATION_CREDENTIALS = filePath;

  console.log("✅ Google credentials ready at:", filePath);
}

dotenv.config();
const app = express();

  cors({
    origin: "http://localhost:3000", // your frontend URL
    credentials: true, // if using cookies or Authorization headers
  })

// Use Helmet to set security headers automatically, including X-Content-Type-Options
app.use(helmet());

// Add Cache-Control header to all responses (here disabling caching as example)
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache'); // for HTTP/1.0 backward compatibility
  res.setHeader('Expires', '0');
  next();
});

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/extracted_data', dataExtractionRoutes);
app.use('/api/audit', auditRoutes);

// Error Handler
app.use(errorHandler);

// // Test route to verify database connection
// import pool from "./dbConnect.js";
// app.get("/test-db", async (req, res) => {
//   try {
//     const result = await pool.query("SELECT NOW()");
//     res.json({ message: "Connected to Neon PostgreSQL!", time: result.rows[0].now });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Database connection failed" });
//   }
// });

// app.listen(3000, () => console.log("Server running on port 3000"));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Customer Onboarding Server running on port ${PORT}`));