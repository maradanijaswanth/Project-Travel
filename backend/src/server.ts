import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import journeyRoutes from './routes/journeyRoutes.js';
import supplierRoutes from './routes/supplierRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import knowledgeRoutes from './routes/knowledgeRoutes.js';
import moduleRoutes from './routes/moduleRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'EXIMIA Journey Composer API',
    version: '1.0.0',
    philosophy: 'AI composes. Humans validate.',
    time: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/journeys', journeyRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/knowledge', knowledgeRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Unhandled Error]:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`✨ EXIMIA Journey Composer Backend is running!`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌍 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🏛️ Architecture Principle: "AI composes. Humans validate."`);
  console.log(`=======================================================`);
});
