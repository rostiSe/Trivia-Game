// /src/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import questionRoutes from './routes/question.routes.js';
import triviaRoutes from './routes/trivia.routes.js';
import authRoutes from './routes/auth.routes.js';
import cookieParser from 'cookie-parser';
import prisma, { testConnection } from './prismaClient.js';

dotenv.config(); // Loads .env

const app = express();

// CORS + JSON body parser
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || true
    : true,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// API health check endpoint for Render and monitoring
app.get('/health', async (req, res) => {
  try {
    // For MongoDB, we can check connection by running a simple command
    // Try to get a user count (will work even if there are no users)
    await prisma.user.count();
    return res.status(200).json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('Health check failed:', error);
    return res.status(500).json({ status: 'error', database: 'disconnected', message: error.message });
  }
});

// Main route
app.get('/', (req, res) => {
  res.send('Hello from Trivia API!');
});

// Use our question routes
app.use('/api/questions', questionRoutes);
app.use('/api/trivia', triviaRoutes);
app.use('/api/auth', authRoutes);
app.get("/api/test-cookie", (req, res) => {
  console.log("Received cookies:", req.cookies);
  res.json({ cookies: req.cookies });
});

// Connect to the database then start the server
const PORT = process.env.PORT || 5000;

// Connect to the database and start the server
async function startServer() {
  let retries = 5;
  
  while (retries) {
    try {
      // Test database connection
      const isConnected = await testConnection();
      if (!isConnected) throw new Error('Database connection test failed');
      
      // Start server only after successful connection
      app.listen(PORT, () => {
        console.log(`✓ Express server running on http://localhost:${PORT}`);
        console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
      });
      
      return; // Exit the function after successful start
    } catch (error) {
      console.error(`Failed to connect to the database (${6-retries}/5):`, error);
      retries -= 1;
      if (retries === 0) {
        console.error('Max retries reached, exiting...');
        process.exit(1);
      }
      // Wait before retrying
      console.log(`Retrying in 5 seconds...`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
