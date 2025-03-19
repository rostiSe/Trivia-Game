import express from 'express'
import { getAllQuestions, saveExternalQuestion } from '../controller/question.controller.js'

const router = express.Router()

router.get('/', getAllQuestions)
router.post('/save', saveExternalQuestion)

export default router