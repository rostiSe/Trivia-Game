import express from 'express';
import { getAllUsers, signInUser, signUpUser } from '../controller/auth.controller.js';

const router = express.Router();

router.get('/', getAllUsers);
router.post('/sign-in', signInUser);
router.post('/sign-up', signUpUser);

export default router;