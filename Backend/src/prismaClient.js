// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
//
// Learn more: 
// https://pris.ly/d/help/next-js-best-practices

// Define a more robust and production-ready Prisma client
let prisma;

// This logic ensures we don't create multiple instances
// during hot reloads in development
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['error'],
    errorFormat: 'minimal',
  });
} else {
  // In development, use global object to preserve connection between reloads
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
      errorFormat: 'pretty',
    });
  }
  prisma = global.prisma;
}

// Additional error handling for connection issues
prisma.$on('error', (e) => {
  console.error('Prisma Client error:', e);
});

// Function to explicitly test connection
export async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✓ Successfully connected to database');
    
    // Check which models are accessible
    const models = Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$'));
    console.log('Available models:', models);
    
    // Check if User model exists
    if (typeof prisma.user === 'undefined') {
      console.error('WARNING: User model is not available in Prisma client!');
      console.log('This might be due to missing schema synchronization.');
    } else {
      console.log('✓ User model is available');
    }
    
    return true;
  } catch (error) {
    console.error('Failed to connect to database:', error);
    return false;
  }
}

export default prisma;