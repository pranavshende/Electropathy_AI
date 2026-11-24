import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import conversationRoutes from './routes/conversationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { prisma } from './db/prisma.js';
import { dbCircuitBreaker } from './db/circuitBreaker.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middlewares
app.use(helmet());
app.use(cors({
  origin: '*', // Allow frontend development
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/admin', adminRoutes);

// Compatibility aliases for direct client routing
app.use('/auth', authRoutes);
app.use('/patients', patientRoutes);
app.use('/conversations', conversationRoutes);
app.use('/admin', adminRoutes);


// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Electropathy AI Backend API',
    smsProvider: process.env.SMS_PROVIDER || 'blacksms',
    timestamp: new Date().toISOString()
  });
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Electropathy AI Backend Server Running!`);
  console.log(`📡 URL: http://0.0.0.0:${PORT}`);
  console.log(`🔐 Phone Number Auth API: http://0.0.0.0:${PORT}/api/auth`);
  console.log(`======================================================\n`);

  // Non-blocking database connectivity check on startup
  prisma.$queryRaw`SELECT 1`
    .then(() => {
      dbCircuitBreaker.recordSuccess();
      console.log('✅ PostgreSQL database connection established.');
    })
    .catch((err) => {
      dbCircuitBreaker.recordError(err);
      console.warn('⚠️ Remote PostgreSQL unavailable. Database circuit breaker engaged (using zero-latency in-memory cache).');
    });
});
