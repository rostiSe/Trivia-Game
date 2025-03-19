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
