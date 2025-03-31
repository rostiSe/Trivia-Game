import prisma from "../prismaClient.js";

export const testGetUserFriends = async (req, res) =>{
    try {
        const response = await prisma.users
        
    } catch (error) {
        console.error("Error fetching user friends:", error);
        return res.status(500).json({
            error: "Failed to fetch user friends",
            details: error.message,
        });
        
    }
}