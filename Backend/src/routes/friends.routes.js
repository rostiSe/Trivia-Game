import express from 'express';
import { acceptRequest, getAllFriends, getReceivedFriendRequests, getSendedFriendRequests, sendRequest } from '../controller/friends.controller.js';

const router = express.Router();

router.get('/:id', getAllFriends);
router.post('/send-request', sendRequest);
router.post('/accept-request', acceptRequest);
router.post('/deny-request', sendRequest);

router.get('/requests/sent/:id', getSendedFriendRequests);
router.get('/requests/received/:id', getReceivedFriendRequests);


export default router;