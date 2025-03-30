// /controllers/questionController.js
import prisma from '../prismaClient.js';

export const saveExternalQuestion = async (req, res) => {
  try {
    // The user sends the entire question object from the OpenTDB result
    // e.g. { category, type, difficulty, question, correct_answer, incorrect_answers, ... }
    const {
      category,
      type,
      difficulty,
      question,
      correct_answer,
      incorrect_answers
    } = req.body;

    // Check if question already exists in db by searching for the question text
    const existingQuestion = await prisma.question.findFirst({
      where: {
        question: question
      }
    });

    // If question already exists, return an error
    if (existingQuestion) {
      return res.status(409).json({ error: "Question already exists" });
    }

    // If question doesn't exist, create it
    const newQ = await prisma.question.create({
      data: {
        category,
        question,
        correctAnswer: correct_answer,       // matches your schema field
        incorrectAnswers: incorrect_answers, // array
        difficulty,
        type,
      },
    });

    return res.status(201).json(newQ);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to save question' });
  }
};

export const getAllQuestions = async (req, res) => {
  try {
    const questions = await prisma.question.findMany();
    return res.status(200).json(questions);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch questions' });
  }
}
export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.body;           // <-- destructure 'id' from body
    console.log("Deleting question ID:", id);

    const deleted = await prisma.question.delete({
      where: { id: id },               // <-- Must match the 'id' field in the schema
    });
    return res.json(deleted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const updateQuestion = async (req, res) => {
  try {
    const { id, category, type, difficulty, question, correctAnswer, incorrectAnswers } = req.body;

    const updated = await prisma.question.update({
      where: { id: id },
      data: {
        category,
        type,
        difficulty,
        question,
        correctAnswer,
        incorrectAnswers,
      }
    });

    return res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}


// Here is the user 
// export const likeQuestionsOfUser = async (req, res) => {
//   const { userId } = req.body; // Assuming you send userId and questionId in the request body

//   try {
//     const likedQuestions = await prisma.question.f
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: 'Failed to like question' });
//   }
// }

export const likeQuestion = async (req, res) => {
  try {
    const { questions, userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    
    if (!questions || !questions.question) {
      return res.status(400).json({ error: "Valid question data is required" });
    }
    
    // Extract question data
    const {
      question,
      correct_answer,
      incorrect_answers,
      category = "Unknown",
      difficulty = "medium", 
      type = "multiple"
    } = questions;

    // First, find or create the question
    let questionRecord = await prisma.question.findFirst({
      where: { question: question }
    });

    if (!questionRecord) {
      questionRecord = await prisma.question.create({
        data: {
          category,
          question,
          correctAnswer: correct_answer,
          incorrectAnswers: incorrect_answers,
          difficulty,
          type,
        },
      });
    }

    // Instead of checking then creating, use upsert to handle both cases
    const questionOfUser = await prisma.questionOfUser.upsert({
      where: {
        // Use the unique constraint from your schema
        questionId_userId: {
          questionId: questionRecord.id,
          userId: userId
        }
      },
      update: {
        // If it exists, we can update the timestamp or any other fields if needed
        // This is optional - if you don't want to change anything, you can leave it empty
        createdAt: new Date() // This will update the timestamp
      },
      create: {
        question: {
          connect: { id: questionRecord.id }
        },
        user: {
          connect: { id: userId }
        },
        answer: ""
      },
    });

    // Check if it was created or updated
    const isNewRecord = questionOfUser.createdAt.getTime() > Date.now() - 1000; // Created in the last second

    return res.status(isNewRecord ? 201 : 200).json({
      message: isNewRecord ? "Question saved successfully" : "Question already saved",
      isNew: isNewRecord,
      question: questionRecord,
      questionOfUser: questionOfUser
    });
  } catch (error) {
    console.error("Error saving question:", error);
    
    // Check for specific Prisma errors
    if (error.code === 'P2002') {
      return res.status(409).json({ 
        error: "You have already saved this question",
        details: "Unique constraint violation"
      });
    }
    
    return res.status(500).json({ 
      error: "Failed to save question", 
      details: error.message 
    });
  }
};

// Get user liked questions
export const getUserLikedQuestions = async (req, res) => {
  try {
    const { id } = req.params; // Assuming you send id in the URL params

    if (!id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const likedQuestions = await prisma.questionOfUser.findMany({
      where: { userId: id },
      include: {
        question: true, // Include the question details
      },
    });

    return res.status(200).json(likedQuestions);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch liked questions' });
  }
};