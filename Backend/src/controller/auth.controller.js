import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../prismaClient.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-very-secure-secret';

// GET All users api/auth/
export const getAllUsers = async (req, res) => {
  try {
    const response = await prisma.user.findMany();
    return res.json(response);
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
}

// PUT check if user is signed in api/auth/me
export const checkUser = async (req, res)=>{
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({ error: 'Invalid token' });
  }
}

// PUT sign in user api/auth/sign-in
export const signInUser = async (req, res)=>{
  const {email, password} = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: req.body.email
        }
    })
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
    res.json({ token });
  } catch (error) {
    res.status(500).json({error: error.message})
  }
}
// PUT sign up user api/auth/sign-up
export const signUpUser = async (req, res)=>{
  const {name, email, password} = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
  try {
    
    const user = await prisma.user.findUnique({
      where: {
        email: email
      }
    })
    if (user) {
      return res.status(400).json({error: "User already exists"})
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    })
    return res.status(201).json(newUser)
  } catch (error) {
    res.status(500).json({error: error.message})
  }
}
