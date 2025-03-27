import express from 'express';
import { getUserById, getAllUsers, testCookie } from '../controller/user.controller.js';

const router = express.Router();

router.get('/', getAllUsers);
router.get('/test/cookie', testCookie)

router.get('/:id', getUserById);

export default router;