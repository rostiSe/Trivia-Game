import express from 'express';
import { getFriendRequests, sendRequest } from '../controller/friends.controller.js';

const router = express.Router();

router.post('/send-request', sendRequest);
router.post('/accept-request', sendRequest);
router.post('/deny-request', sendRequest);

router.get('/requests/:id', getFriendRequests);


export default router;