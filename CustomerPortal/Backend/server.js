import './loadenv.js';
import express from 'express';
import fs from 'fs';
import https from 'https';
import mongoose from 'mongoose';
import routes from './routes/index.js';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

const app = express();
const PORT = process.env.PORT || 8000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/INSY7314';
const USE_HTTPS = process.env.USE_HTTPS === 'true';

// Middleware
app.use(helmet());
app.use(morgan('dev'));

const allowedOrigins = [
'https://localhost:5173', // vite default 
'http://localhost:5173', 
'https://localhost:3000', // CRA default 
'http://localhost:3000'
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
app.use('/api/auth/login', loginLimiter);

app.use(express.json());
app.use('/api', routes);

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
        console.log(`HTTPS Server is running on port ${PORT}`);
      });
    } else {
      app.listen(PORT, () => {
        console.log(`HTTP server is running on port ${PORT}`);
      });
    }
  })
  .catch((err) => {
    console.error('Could not connect to MongoDB:', err);
  });
 
// Chaitanya, A. (2023) Salting and Hashing Passwords with bcrypt.js: A Comprehensive Guide, Medium. Available at: https://medium.com/@arunchaitanya/salting-and-hashing-passwords-with-bcrypt-js-a-comprehensive-guide-f5e31de3c40c (Accessed: October 10, 2025).
// Cross-Origin Resource Sharing (CORS) (no date) MDN Web Docs. Available at: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS (Accessed: October 10, 2025).
// Getting started (no date) Mongoosejs.com. Available at: https://mongoosejs.com/docs/ (Accessed: October 10, 2025).
// Zanini, A. (2023) Using Helmet in Node.js to secure your application, LogRocket Blog. Available at: https://blog.logrocket.com/using-helmet-node-js-secure-application/ (Accessed: October 10, 2025).
// (No date) Reddit.com. Available at: https://www.reddit.com/r/node/comments/1buqb2k/how_to_implement_rate_limiting_in_express_for/ (Accessed: October 10, 2025).
// Porosh (2023) Connecting the Backend and Frontend with Node.Js: A Guide to Secure and efficient communication, Medium. Available at: https://mdjamilkashemporosh.medium.com/connecting-the-backend-and-frontend-with-node-js-a-guide-to-secure-and-efficient-communication-3797d59599fb (Accessed: October 10, 2025).

