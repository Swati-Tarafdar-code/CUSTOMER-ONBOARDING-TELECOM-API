import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import dataExtractionRoutes from './routes/dataExtractionRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();
const app = express();

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