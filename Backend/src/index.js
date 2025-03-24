// /src/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import questionRoutes from './routes/question.routes.js';
import triviaRoutes from './routes/trivia.routes.js';
import authRoutes from './routes/auth.routes.js';
import cookieParser from 'cookie-parser';
import prisma, { testConnection } from './prismaClient.js';
import bcrypt from 'bcrypt';

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
    // Check using the Question model which we know works
    await prisma.question.count();
    return res.status(200).json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('Health check failed:', error);
    return res.status(500).json({ status: 'error', database: 'disconnected', message: error.message });
  }
});

// Diagnostic endpoint to check Prisma models
app.get('/api/diagnostics', (req, res) => {
  try {
    // List available Prisma models and methods
    const availableModels = Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$'));
    
    // Check if methods exist on the user model
    const userModelExists = typeof prisma.user !== 'undefined';
    const userMethods = userModelExists ? Object.keys(prisma.user).filter(k => !k.startsWith('_')) : [];
    
    // Check if methods exist on the question model 
    const questionModelExists = typeof prisma.question !== 'undefined';
    const questionMethods = questionModelExists ? Object.keys(prisma.question).filter(k => !k.startsWith('_')) : [];
    
    return res.status(200).json({
      availableModels,
      userModelExists,
      userMethods,
      questionModelExists,
      questionMethods,
      nodeEnv: process.env.NODE_ENV || 'not set',
      databaseUrl: process.env.DATABASE_URL ? 'Set but not shown' : 'Not set'
    });
  } catch (error) {
    console.error('Diagnostics failed:', error);
    return res.status(500).json({ error: error.message });
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

// API route to manually create the User model if it doesn't exist
app.get('/api/setup/user-model', async (req, res) => {
  try {
    // Check if prisma.user exists
    if (typeof prisma.user === 'undefined') {
      return res.status(500).json({ 
        error: 'User model not available in Prisma client. Please run prisma db push.' 
      });
    }
    
    // Try to create a test user to ensure the collection exists
    try {
      // First check if the email already exists
      const testUser = await prisma.user.findUnique({
        where: { email: 'test@example.com' }
      });
      
      if (!testUser) {
        // Create a test user (this will create the collection if it doesn't exist)
        await prisma.user.create({
          data: {
            name: 'Test User',
            email: 'test@example.com',
            password: await bcrypt.hash('testpassword', 10)
          }
        });
      }
      
      // Count users to verify it's working
      const count = await prisma.user.count();
      
      return res.status(200).json({ 
        success: true, 
        message: 'User model is working correctly',
        userCount: count
      });
    } catch (error) {
      console.error('Error testing User model:', error);
      return res.status(500).json({ 
        error: `Error with User model: ${error.message}` 
      });
    }
  } catch (error) {
    console.error('User model setup failed:', error);
    return res.status(500).json({ error: error.message });
  }
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
