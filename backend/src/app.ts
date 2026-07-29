import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import dotenv from 'dotenv';

import apiRouter from './routes/api';
import { errorHandler } from './middlewares/error';
import { connectDB } from './utils/db';
import { validateEnv } from './config/env';
import { blacklistMiddleware } from './middlewares/blacklist';
import { requestIdMiddleware } from './middlewares/requestId';
import { loggingMiddleware } from './middlewares/logging';

dotenv.config();
validateEnv();

const app = express();
const PORT = Number(process.env.PORT) || 6000;

/* -------------------------------------------------------------------------- */
/*                               Security                                     */
/* -------------------------------------------------------------------------- */

app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      },
    },
  })
);

const allowedOrigins = (
  process.env.ALLOWED_ORIGINS || 'http://localhost:3000'
)
  .split(',')
  .map(origin => origin.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Origin not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

/* -------------------------------------------------------------------------- */
/*                               Rate Limits                                  */
/* -------------------------------------------------------------------------- */

app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: {
      success: false,
      message: 'Too many requests. Please try again later.',
    },
  })
);

app.use(
  '/api/auth',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
      success: false,
      message: 'Too many authentication attempts.',
    },
  })
);

app.use(
  '/api/coupons/validate',
  rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: {
      success: false,
      message: 'Too many coupon validation requests.',
    },
  })
);

/* -------------------------------------------------------------------------- */
/*                              Middlewares                                   */
/* -------------------------------------------------------------------------- */

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use(requestIdMiddleware);
app.use(loggingMiddleware);

app.use(
  '/uploads',
  express.static(path.join(__dirname, '../public/uploads'))
);

/* -------------------------------------------------------------------------- */
/*                                 Routes                                     */
/* -------------------------------------------------------------------------- */

app.get('/', (_req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Bakery Hub Backend</title>
        <style>
          body{
            margin:0;
            font-family:Arial, Helvetica, sans-serif;
            background:#f8f9fa;
            display:flex;
            justify-content:center;
            align-items:center;
            height:100vh;
          }

          .card{
            background:#fff;
            padding:40px;
            border-radius:12px;
            box-shadow:0 5px 20px rgba(0,0,0,.15);
            text-align:center;
            max-width:500px;
          }

          h1{
            color:#28a745;
            margin-bottom:10px;
          }

          p{
            color:#555;
          }

          a{
            color:#007bff;
            text-decoration:none;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>🍰 Bakery Hub Backend</h1>
          <h2>✅ Server is Running</h2>
          <p>Backend is successfully running on Port <strong>${PORT}</strong>.</p>
          <p><a href="/health">Health Check</a></p>
        </div>
      </body>
    </html>
  `);
});

app.get('/health', async (_req, res) => {
  try {
    const db = await connectDB();

    res.status(200).json({
      status: 'healthy',
      database: db.databaseName,
      uptime: `${Math.floor(process.uptime())} seconds`,
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(503).json({
      status: 'unhealthy',
      error: 'Database connection failed',
      timestamp: new Date().toISOString(),
    });
  }
});

app.use('/api', blacklistMiddleware, apiRouter);

/* -------------------------------------------------------------------------- */
/*                             Error Handler                                  */
/* -------------------------------------------------------------------------- */

app.use(errorHandler);

/* -------------------------------------------------------------------------- */
/*                              Start Server                                  */
/* -------------------------------------------------------------------------- */

if (process.env.NODE_ENV !== 'test') {
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log('==========================================');
        console.log('🚀 Bakery Hub Backend Started Successfully');
        console.log(`🌐 URL    : http://localhost:${PORT}`);
        console.log(`❤️ Health : http://localhost:${PORT}/health`);
        console.log('==========================================');
      });
    })
    .catch((err) => {
      console.error('❌ Failed to connect to MongoDB');
      console.error(err);
      process.exit(1);
    });
}

export default app;