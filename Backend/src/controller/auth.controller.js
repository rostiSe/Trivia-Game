import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../prismaClient.js';
import { MongoClient, ObjectId } from 'mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-very-secure-secret';

// Reference to the direct MongoDB connection (will be set at runtime if needed)
let directDb;

// Helper function to get MongoDB connection if Prisma user model is unavailable
async function getDirectDbIfNeeded() {
  // If User model is available in Prisma, use it
  if (typeof prisma.user !== 'undefined') {
    return null;
  }
  
  // If we already have a direct connection, use it
  if (directDb) {
    return directDb;
  }
  
  // Otherwise, try to establish a direct connection
  try {
    console.log('Falling back to direct MongoDB connection for auth operations');
    const client = new MongoClient(process.env.DATABASE_URL);
    await client.connect();
    directDb = client.db();
    return directDb;
  } catch (error) {
    console.error('Failed to establish direct MongoDB connection:', error);
    return null;
  }
}

// GET All users api/auth/
export const getAllUsers = async (req, res) => {
  try {
    // Check if User model is available
    if (typeof prisma.user === 'undefined') {
      console.error("User model is not available in Prisma client");
      
      // Try direct MongoDB approach
      const db = await getDirectDbIfNeeded();
      if (db) {
        const users = await db.collection('User').find().toArray();
        return res.json(users);
      }
      
      return res.status(500).json({ 
        error: 'Database schema issue: User model not available',
        hint: 'Please ensure your Prisma schema is properly synchronized with the database'
      });
    }
    
    const response = await prisma.user.findMany();
    return res.json(response);
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ error: 'Failed to fetch users', details: error.message });
  }
}

// PUT check if user is signed in api/auth/me
export const checkUser = async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'No token provided' });
  
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    
    // Check if User model is available in Prisma
    if (typeof prisma.user === 'undefined') {
      console.log("Using direct MongoDB for checkUser as Prisma user model is unavailable");
      
      // Try direct MongoDB approach
      const db = await getDirectDbIfNeeded();
      if (db) {
        let user;
        try {
          user = await db.collection('User').findOne({ _id: new ObjectId(payload.userId) });
        } catch (err) {
          console.error("Error finding user by ID:", err);
          return res.status(404).json({ error: 'User not found' });
        }
        
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        return res.json(userWithoutPassword);
      }
      
      return res.status(500).json({ error: 'User model not available' });
    }
    
    // Original Prisma approach
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const { password, ...userWithoutPassword } = user;
    return res.json(userWithoutPassword);
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// PUT sign in user api/auth/sign-in
export const signInUser = async (req, res) => {
  const {email, password} = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  try {
    // Check if User model is available in Prisma
    if (typeof prisma.user === 'undefined') {
      console.log("Using direct MongoDB for signInUser as Prisma user model is unavailable");
      
      // Try direct MongoDB approach
      const db = await getDirectDbIfNeeded();
      if (db) {
        const user = await db.collection('User').findOne({ email: email });
        
        if (!user) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });
        
        const token = jwt.sign({ 
          userId: user._id.toString(), 
          email: user.email 
        }, JWT_SECRET, { expiresIn: '1d' });
        
        res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 24 * 60 * 60 * 1000, // 1 day
        });
        
        return res.json({ token });
      }
      
      return res.status(500).json({ error: 'User model not available' });
    }
    
    // Original Prisma approach
    const user = await prisma.user.findUnique({
      where: { email: req.body.email }
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });
    
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
    
    return res.json({ token });
  } catch (error) {
    console.error("Sign in error:", error);
    return res.status(500).json({ error: error.message });
  }
}

// PUT sign up user api/auth/sign-up
export const signUpUser = async (req, res) => {
  const {name, email, password} = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  try {
    // Check if User model is available in Prisma
    if (typeof prisma.user === 'undefined') {
      console.log("Using direct MongoDB for signUpUser as Prisma user model is unavailable");
      
      // Try direct MongoDB approach
      const db = await getDirectDbIfNeeded();
      if (db) {
        // Check if user already exists
        const existingUser = await db.collection('User').findOne({ email: email });
        
        if (existingUser) {
          return res.status(400).json({ error: "User already exists" });
        }
        
        // Create new user
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await db.collection('User').insertOne({
          name,
          email,
          password: hashedPassword,
          createdAt: new Date()
        });
        
        // Get the created user (without password)
        const newUser = await db.collection('User').findOne({ _id: result.insertedId });
        const { password: _, ...userWithoutPassword } = newUser;
        
        return res.status(201).json(userWithoutPassword);
      }
      
      return res.status(500).json({ error: 'User model not available' });
    }
    
    // Original Prisma approach
    const user = await prisma.user.findUnique({
      where: { email: email }
    });
    
    if (user) {
      return res.status(400).json({ error: "User already exists" });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    });
    
    return res.status(201).json(newUser);
  } catch (error) {
    console.error("Sign up error:", error);
    return res.status(500).json({ error: error.message });
  }
}
