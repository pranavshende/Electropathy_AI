import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import patientRoutes from './routes/patientRoutes.js';

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


// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Electropathy AI Backend API',
    smsProvider: process.env.SMS_PROVIDER || 'blacksms',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Electropathy AI Backend Server Running!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🔐 Phone Number Auth API: http://localhost:${PORT}/api/auth`);
  console.log(`======================================================\n`);
});
