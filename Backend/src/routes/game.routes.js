import express from 'express';
import { addMatch, addPoint, getUserPointsAndMatch } from '../controller/game.controller.js';

const router = express.Router();

router.post('/add-point', addPoint)
router.post('/add-match', addMatch)
router.get('/stats/:id', getUserPointsAndMatch)

export default router