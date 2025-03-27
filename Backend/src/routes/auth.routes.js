import express from 'express';
import { checkUser, getAllUsers, signInUser, signUpUser, signOutUser } from '../controller/auth.controller.js';
import { setCookieMiddleware } from '../middleware/cookie.middleware.js';

const router = express.Router();

router.use(setCookieMiddleware);

router.get('/', getAllUsers);
router.get('/me', checkUser);
router.get('/sign-out', signOutUser);

router.post('/sign-in', signInUser);
router.post('/sign-up', signUpUser);

export default router;