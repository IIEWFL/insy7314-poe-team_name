import './loadenv.js';
import express from 'express';
import fs from 'fs';
import https from 'https';
import mongoose from 'mongoose';
import employeeRoutes from './routes/employeeIndexRoutes.js';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

const app = express();
const PORT = process.env.PORT || 8001; // Different port from customer portal
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/INSY7314';
const USE_HTTPS = process.env.USE_HTTPS === 'true';

// Middleware
app.use(helmet());
app.use(morgan('dev'));

const allowedOrigins = [
  'https://localhost:5173',
  'http://localhost:5173',
  'https://localhost:3000',
  'http://localhost:3000',
  'https://localhost:5174', // For separate employee frontend
  'http://localhost:5174'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// Global rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Login-specific stricter rate limit
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/employee/auth/login', loginLimiter);

app.use(express.json());
app.use('/api/employee', employeeRoutes);

// Connect to MongoDB and start server
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    if (USE_HTTPS) {
      const sslOptions = {
        key: fs.readFileSync('./certs/localhost-key.pem'),
        cert: fs.readFileSync('./certs/localhost.pem'),
      };
      https.createServer(sslOptions, app).listen(PORT, () => {
        console.log(`HTTPS Employee Portal Server is running on port ${PORT}`);
      });
    } else {
      app.listen(PORT, () => {
        console.log(`HTTP Employee Portal Server is running on port ${PORT}`);
      });
    }
  })
  .catch((err) => {
    console.error('Could not connect to MongoDB:', err);
  });