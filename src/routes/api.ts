import express from 'express';
import {
    addStakingData,
    getRoom,
    getRoomsPlayedWithUsernames,
    getStakingData,
    getUser,
    joinRoom,
    setupUser,
  updateStakedStatus,
  updateUserScore
} from '../controllers/userController';

const router = express.Router();

router.post('/user/setup', setupUser);
router.get('/user/:walletAddress', getUser);
router.post('/room/join', joinRoom);
router.get('/room/:roomId', getRoom);
router.post('/stake/history/add', addStakingData);
router.get('/stake/history/:walletAddress', getStakingData);
router.post('/user/update-score', updateUserScore);
router.post('/stake', updateStakedStatus);

router.get('/user/rooms-played/:walletAddress', getRoomsPlayedWithUsernames);

export default router;