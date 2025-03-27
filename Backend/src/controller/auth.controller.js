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
  // Try to get token from multiple sources
  let token = req.cookies.token;
  
  // Log all received cookies for debugging
  console.log("All cookies received:", req.cookies);
  
  // If no token in cookies, check authorization header
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    // Format should be "Bearer [token]"
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7, authHeader.length);
    }
  }
  
  // If still no token, check query parameter (not recommended for production)
  if (!token && req.query.token) {
    token = req.query.token;
  }
  
  if (!token) {
    return res.status(401).json({ 
      error: 'No token provided', 
      message: 'Please provide a token in cookies, Authorization header, or query parameter'
    });
  }
  
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    
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
    res.setCookieWithOptions(token);
    // Set token in cookie with improved settings for cross-origin
    console.log("Attempting to set cookie after signin..." + token);
    
    // Create cookie options based on environment
    const cookieOptions = {
      // httpOnly means the cookie cannot be accessed by JavaScript
      httpOnly: true,
      
      // In production, secure should be true. In development, if not using HTTPS, set to false
      secure: process.env.NODE_ENV === 'production',
      
      // For cross-domain and hosting platforms like Render/Firebase, None is often needed
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      
      // Cookie expiration
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      
      // Ensure cookie is available across the site
      path: '/',
    };
    
    console.log("Using cookie options:", cookieOptions);
    
    // // Special handling for Firebase/Render hosting
    // if (process.env.HOSTING_PLATFORM === 'firebase' || process.env.HOSTING_PLATFORM === 'render') {
    //   // Firebase and some Render configs require the __session cookie name
    //   res.cookie('__session', token, cookieOptions);
    //   console.log("Set __session cookie for Firebase/Render compatibility");
    // }
    
    // Set standard token cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    });
    
    console.log("Cookie set headers:", res.getHeaders());
    
    // Return the token in response body as well for clients that prefer using Authorization header
    return res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      message: 'Login successful',
      cookieInfo: {
        name: 'token',
        options: cookieOptions
      }
    });
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
        
        // Create and set token after signup
        const token = jwt.sign({ 
          userId: newUser._id.toString(), 
          email: newUser.email 
        }, JWT_SECRET, { expiresIn: '1d' });
        
        console.log("Attempting to set cookie after signup (MongoDB)...");
        
        // Create cookie options based on environment
        const cookieOptions = {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
          maxAge: 24 * 60 * 60 * 1000,
          path: '/',
        };
        
        console.log("Using cookie options:", cookieOptions);
        
        // Special handling for Firebase/Render hosting
        if (process.env.HOSTING_PLATFORM === 'firebase' || process.env.HOSTING_PLATFORM === 'render') {
          res.cookie('__session', token, cookieOptions);
          console.log("Set __session cookie for Firebase/Render compatibility");
        }
        
        // Set standard token cookie
        res.cookie('token', token, cookieOptions);
        
        console.log("Cookie set headers:", res.getHeaders());
        
        return res.status(201).json({
          ...userWithoutPassword,
          token,
          message: 'Signup successful'
        });
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
    
    // Create and set token after signup
    const token = jwt.sign({ 
      userId: newUser.id, 
      email: newUser.email 
    }, JWT_SECRET, { expiresIn: '1d' });
    
    console.log("Attempting to set cookie after signup (Prisma)...");
   
    // Create cookie options based on environment
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    };
    
    console.log("Using cookie options:", cookieOptions);
    
    // Special handling for Firebase/Render hosting
    if (process.env.HOSTING_PLATFORM === 'firebase' || process.env.HOSTING_PLATFORM === 'render') {
      res.cookie('__session', token, cookieOptions);
      console.log("Set __session cookie for Firebase/Render compatibility");
    }
    
    // Set standard token cookie
    res.cookie('token', token, cookieOptions);
    
    console.log("Cookie set headers:", res.getHeaders());
    
    // Don't expose the password
    const { password: _, ...userWithoutPassword } = newUser;
    
    return res.status(201).json({
      ...userWithoutPassword,
      token,
      message: 'Signup successful'
    });
  } catch (error) {
    console.error("Sign up error:", error);
    return res.status(500).json({ error: error.message });
  }
}

// Sign-Out User api/auth/sign-out
export const signOutUser = async (req, res) => {
  res.clearCookie('token');
  res.clearCookie('__session');
  return res.status(200).json({ message: 'Sign out successful' });
}