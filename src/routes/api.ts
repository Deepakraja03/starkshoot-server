import express from 'express';
import {
    addLeaderboardEntry,
    addStakingData,
    getLeaderboardByRoom,
    getLeaderboardByWallet,
    getRoom,
    getRoomsPlayedWithUsernames,
    getStakingData,
    getUser,
    getUserStakeStatus,
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
router.get('/user/is-staked/:walletAddress', getUserStakeStatus);

router.get('/user/rooms-played/:walletAddress', getRoomsPlayedWithUsernames);

router.post('/leaderboard/add', addLeaderboardEntry);
router.get('/leaderboard/wallet/:walletAddress', getLeaderboardByWallet);
router.get('/leaderboard/room/:roomId', getLeaderboardByRoom);

export default router;