// ... existing code ...

import prisma from "../prismaClient.js";

// GET user by ID api/user/:id
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'ID parameter is required' });
    }
        
    // Original Prisma approach
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: id
        }
      });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Remove password from result
      const { password, ...userWithoutPassword } = user;
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      if (error.message.includes('invalid input syntax')) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }
      throw error;
    }
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    return res.status(500).json({ error: 'Failed to fetch user', details: error.message });
  }
}

export const testCookie = async (req, res) => {
  res.cookie('token', "pls", {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000,
    path: '/',
  });
  return res.status(200).json()
}

// GET All users api/user
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    // Remove passwords from all users
    const usersWithoutPasswords = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }); 
    return res.json(usersWithoutPasswords);
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ error: 'Failed to fetch users', details: error.message });
  }
}