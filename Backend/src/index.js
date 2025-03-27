// /src/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import questionRoutes from './routes/question.routes.js';
import triviaRoutes from './routes/trivia.routes.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import cookieParser from 'cookie-parser';
import prisma, { testConnection } from './prismaClient.js';
import bcrypt from 'bcrypt';
import { MongoClient } from 'mongodb';
import { setCookieMiddleware } from './middleware/cookie.middleware.js';

dotenv.config(); // Loads .env

// Setup direct MongoDB connection as fallback
let mongoClient;
let directDb;

async function connectMongo() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable not set');
    return false;
  }

  try {
    mongoClient = new MongoClient(process.env.DATABASE_URL);
    await mongoClient.connect();
    directDb = mongoClient.db();
    console.log('✓ Direct MongoDB connection established as fallback');
    return true;
  } catch (err) {
    console.error('Failed to establish direct MongoDB connection:', err);
    return false;
  }
}

const app = express();

// CORS + JSON body parser
// Determine CORS settings based on environment
const corsOptions = {
  origin: true, // Reflects the request's origin
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['set-cookie'],
};

console.log('Using CORS settings:', corsOptions);
app.use(cors(corsOptions));
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
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/trivia', triviaRoutes);

// Simple cookie test endpoint  
  

// Set hosting platform
app.get('/api/set-platform/:platform', (req, res) => {
  const { platform } = req.params;
  if (['render', 'firebase', 'heroku', 'vercel', 'netlify', 'local'].includes(platform)) {
    process.env.HOSTING_PLATFORM = platform;
    console.log(`Set hosting platform to: ${platform}`);
    return res.json({ 
      success: true, 
      message: `Hosting platform set to ${platform}`,
      hostingPlatform: process.env.HOSTING_PLATFORM 
    });
  } else {
    return res.status(400).json({ 
      error: 'Invalid platform', 
      validOptions: ['render', 'firebase', 'heroku', 'vercel', 'netlify', 'local'] 
    });
  }
});

// API route to manually create the User model if it doesn't exist
app.get('/api/setup/user-model', async (req, res) => {
  try {
    // Check if prisma.user exists
    if (typeof prisma.user === 'undefined') {
      console.log('Prisma User model not available, trying direct MongoDB approach');
      
      // Try direct MongoDB access
      if (!directDb) {
        const connected = await connectMongo();
        if (!connected) {
          return res.status(500).json({
            error: 'User model not available in Prisma client and failed to connect directly to MongoDB'
          });
        }
      }
      
      // Create User collection if it doesn't exist
      try {
        const collections = await directDb.listCollections().toArray();
        const userCollectionExists = collections.some(c => c.name === 'User');
        
        if (!userCollectionExists) {
          await directDb.createCollection('User');
          console.log('Created User collection directly in MongoDB');
        }
        
        // Check if test user exists
        const testUser = await directDb.collection('User').findOne({ email: 'test@example.com' });
        
        if (!testUser) {
          // Create a test user
          const hashedPassword = await bcrypt.hash('testpassword', 10);
          await directDb.collection('User').insertOne({
            name: 'Test User',
            email: 'test@example.com',
            password: hashedPassword,
            createdAt: new Date()
          });
          console.log('Created test user directly in MongoDB');
        }
        
        const count = await directDb.collection('User').countDocuments();
        
        return res.status(200).json({
          success: true,
          message: 'User collection is accessible via direct MongoDB connection',
          userCount: count,
          note: 'Prisma User model is still not available - a server restart may be needed'
        });
      } catch (dbError) {
        console.error('Error working directly with MongoDB:', dbError);
        return res.status(500).json({
          error: `Error with direct MongoDB access: ${dbError.message}`
        });
      }
    }
    
    // Original Prisma approach continues below
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

// Add this test route
app.get('/api/test-cookie-middleware', setCookieMiddleware, (req, res) => {
    const token = "test-token-123";
    res.setCookieWithOptions(token);
    res.json({ message: 'Test cookie set' });
});

// Connect to the database then start the server
const PORT = process.env.PORT || 5000;

// Connect to the database and start the server
async function startServer() {
  let retries = 5;
  
  // First try to establish direct MongoDB connection as a fallback
  await connectMongo();
  
  while (retries) {
    try {
      // Test database connection
      const isConnected = await testConnection();
      if (!isConnected) throw new Error('Database connection test failed');
      
      // Dynamically add User model if it doesn't exist
      if (typeof prisma.user === 'undefined') {
        console.warn('User model not found. Attempting runtime workaround...');
        
        try {
          // This creates a manual proxy for the User model operations
          // It won't have type safety but will allow basic CRUD operations
          const db = prisma._baseDmmf.datamodel;
          const userModelExists = db.models.find(m => m.name === 'User');
          
          if (userModelExists) {
            console.log('User model found in schema but not in client. Creating proxy...');
            
            // Create a proxy for basic User operations
            prisma.user = {
              async findMany() {
                return await prisma.$queryRaw`db.User.find({})`;
              },
              async findUnique({ where }) {
                if (where.id) {
                  return await prisma.$queryRaw`db.User.findOne({ "_id": ObjectId("${where.id}") })`;
                }
                if (where.email) {
                  return await prisma.$queryRaw`db.User.findOne({ "email": "${where.email}" })`;
                }
                return null;
              },
              async create({ data }) {
                return await prisma.$queryRaw`db.User.insertOne(${JSON.stringify(data)})`;
              },
              async count() {
                const result = await prisma.$queryRaw`db.User.count({})`;
                return result ? parseInt(result) : 0;
              }
            };
            console.log('✓ User model proxy created successfully');
          } else {
            console.error('User model not found in schema definition either. Cannot create proxy.');
          }
        } catch (proxyError) {
          console.error('Failed to create User model proxy:', proxyError);
        }
      }
      
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
