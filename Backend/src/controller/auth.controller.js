import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'your-very-secure-secret';

export const getAllUsers = async (req, res)=>{
  const response = await prisma.user.findMany()
  return res.json(response);
}
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
    res.json({ token });
  } catch (error) {
    res.status(500).json({error: error.message})
  }
}
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
