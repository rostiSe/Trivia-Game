import express from 'express'
import { deleteQuestion, getAllQuestions, saveExternalQuestion, updateQuestion } from '../controller/question.controller.js'

const router = express.Router()

router.get('/', getAllQuestions)
router.post('/save', saveExternalQuestion)
router.delete('/delete', deleteQuestion)
router.put('/update', updateQuestion)

export default router