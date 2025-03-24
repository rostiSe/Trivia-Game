import express from 'express';
import { checkUser, getAllUsers, signInUser, signUpUser } from '../controller/auth.controller.js';

const router = express.Router();

router.get('/', getAllUsers);
router.get('/me', checkUser);
router.post('/sign-in', signInUser);
router.post('/sign-up', signUpUser);

export default router;