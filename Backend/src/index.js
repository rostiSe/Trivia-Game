// /src/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import questionRoutes from './routes/question.routes.js';
import triviaRoutes from './routes/trivia.routes.js';
import authRoutes from './routes/auth.routes.js';
import cookieParser from 'cookie-parser';
import prisma from './prismaClient.js';

dotenv.config(); // Loads .env

const app = express();

// CORS + JSON body parser
app.use(cors());
app.use(express.json());
app.use(cookieParser());

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

// Add a health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Connect to the database and start the server
async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('Successfully connected to the database');
    
    app.listen(PORT, () => {
      console.log(`Express server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to the database', error);
    process.exit(1);
  }
}

startServer();
