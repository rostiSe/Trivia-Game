import prisma from '../prismaClient.js'; // Make sure prisma is imported correctly

export const addPoint = async (req, res) => {
    try {
        const { userId, points } = req.body;

        if (!userId) {
             return res.status(400).json({ error: "userId is required in the request body" });
        }

        // --- FIX HERE: Use lowercase singular model name ---
        const updatedUser = await prisma.user.update({ // Changed from prisma.users
            where: { id: userId },
            data: {
                points: { increment: points }
            },
        });
        // --- End Fix ---

        // Optional: Check if user was actually found and updated
        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.status(200).json(updatedUser);
    } catch (error) {
        // More specific error logging if possible
        if (error.code === 'P2025') { // Prisma code for record not found on update
             console.error("Error adding points: User not found for ID:", userId);
             return res.status(404).json({ error: "User not found" });
        }
        console.error("Error adding points:", error);
        return res.status(500).json({ error: "Failed to add points" });
    }
}

export const addMatch = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId ) {
            return res.status(400).json({ error: "userId and matchId are required in the request body" });
        }

        // --- FIX HERE: Use lowercase singular model name ---
        const updatedUser = await prisma.user.update({ // Changed from prisma.users
            where: { id: userId },
            data: {
                matches: { increment: 1 }
            },
        });
        // --- End Fix ---

        // Optional: Check if user was actually found and updated
        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.status(200).json(updatedUser);
        
    } catch (error) {
        console.error("Error adding match:", error);
        return res.status(500).json({ error: "Failed to add match" });
        
    }
}

export const getUserPointsAndMatch = async (req, res) => {
    try {
        const response = await prisma.user.findUnique({
            where: {
                id: req.params.id
            },
            select: {
                points: true,
                matches: true,
            }
        });
        if (!response) {
            return res.status(404).json({ error: "User not found" });
        }
        return res.status(200).json(response);
    } catch (error) {
        console.error("Error fetching user points:", error);
        return res.status(500).json({ error: "Failed to fetch user points" });
        
    }
}
