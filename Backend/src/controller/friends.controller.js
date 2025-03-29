export const sendRequest = async (req, res) => {
  try {
    const { receiverId, senderId } = req.body;
    console.log("Received friend request:", { receiverId, senderId });

    if (!receiverId || !senderId) {
      console.log("Missing required fields:", { receiverId, senderId });
      return res.status(400).json({
        error: "Missing required fields",
        details: {
          senderId: !senderId ? "Sender ID is required" : null,
          receiverId: !receiverId ? "Receiver ID is required" : null,
        },
      });
    }

    // Check if users exist
    const [sender, receiver] = await Promise.all([
      prisma.user.findUnique({ where: { id: senderId } }),
      prisma.user.findUnique({ where: { id: receiverId } }),
    ]);

    if (!sender || !receiver) {
      return res.status(404).json({
        error: "User not found",
        details: {
          sender: !sender ? "Sender not found" : null,
          receiver: !receiver ? "Receiver not found" : null,
        },
      });
    }

    // Check if request already exists
    const existingRequest = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      },
    });

    if (existingRequest) {
      return res.status(409).json({
        error: "Friend request already exists",
        status: existingRequest.status,
      });
    }

    const response = await prisma.friendRequest.create({
      data: {
        senderId,
        receiverId,
        status: "PENDING",
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return res.status(201).json(response);
  } catch (error) {
    console.error("Error sending friend request:", error);
    return res.status(500).json({
      error: "Failed to send friend request",
      details: error.message,
    });
  }
};
export const getReceivedFriendRequests = async (req, res) => {
  const { id } = await req.params;

  try {
    const response = await prisma.friendRequest.findMany({
      where: {
        receiverId: id,
        status: "PENDING",
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    if (!response) {
      return res.status(404).json({ error: "No friend requests found" });
    }
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching friend requests:", error);
    return res.status(500).json({
      error: "Failed to fetch friend requests",
      details: error.message,
    });
  }
};
export const getSendedFriendRequests = async (req, res) => {
    const { id } = await req.params;
  
    try {
      const response = await prisma.friendRequest.findMany({
        where: {
          senderId: id,
          status: "PENDING",
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          receiver: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
      if (!response) {
        return res.status(404).json({ error: "No friend requests found" });
      }
      return res.status(200).json(response);
    } catch (error) {
      console.error("Error fetching friend requests:", error);
      return res.status(500).json({
        error: "Failed to fetch friend requests",
        details: error.message,
      });
    }
  };
  

export const acceptRequest = async (req, res) => {
  const { senderId, receiverId } = req.body;

  try {
    const response = await prisma.friendRequest.update({
      where: { senderId_receiverId: { senderId, receiverId } },
      data: {
        status: "ACCEPTED",
      },
    });
    if (!response) {
      return res.status(404).json({ error: "Friend request not found" });
    }
    // Create a two-way friendship (optional, if you want bidirectional)
    const [userId, friendId] = [senderId, receiverId].sort();

    const existingFriendship = await prisma.friendship.findUnique({
      where: { userId_friendId: { userId, friendId } },
    });

    if (!existingFriendship) {
      await prisma.friendship.create({
        data: { userId, friendId },
      });
    }
    return res.status(200).json({
      message: "Friend request accepted successfully",
      friendRequest: response,
    });
  } catch (error) {
    console.error("Error accepting friend request:", error);
    return res.status(500).json({
      error: "Failed to accept friend request",
      details: error.message,
    });
  }
};
export const getAllFriends = async (req, res) => {
    const { id } = req.params;
    
    try {
        const friends = await prisma.friendship.findMany({
        where: {
            OR: [
            { userId: id },
            { friendId: id },
            ],
        },
        include: {
            user: {
            select: {
                id: true,
                name: true,
                email: true,
            },
            },
            friend: {
            select: {
                id: true,
                name: true,
                email: true,
            },
            },
        },
        });
    
        return res.status(200).json(friends);
    } catch (error) {
        console.error("Error fetching friends:", error);
        return res.status(500).json({
        error: "Failed to fetch friends",
        details: error.message,
        });
    }
}