import express from 'express'
import { deleteQuestion, getAllQuestions, getUserLikedQuestions, likeQuestion, saveExternalQuestion, updateQuestion } from '../controller/question.controller.js'


const router = express.Router()

router.get('/', getAllQuestions)
router.get('/liked/:id', getUserLikedQuestions)
router.post('/save', saveExternalQuestion)
router.post('/like', likeQuestion)
router.delete('/delete', deleteQuestion)
router.put('/update', updateQuestion)

export default router