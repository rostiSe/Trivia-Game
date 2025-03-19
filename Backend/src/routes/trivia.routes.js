import express from 'express'
import { fetchTriviaCategories, fetchTriviaQuestions } from '../controller/trivia.controller.js'

const router = express.Router()

router.get('/', fetchTriviaQuestions)
router.get('/categories', fetchTriviaCategories)

export default router