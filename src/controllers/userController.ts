import { Request, Response } from 'express';
import { User } from '../models/User';
import { Room } from '../models/Room';
import { StakingHistory } from '../models/StakingHistory';
import { Leaderboard } from '../models/Leaderboard';

// Update staked status
export const updateStakedStatus = async (req: Request, res: Response) => {
  const { walletAddress, isStaked } = req.body;
  try {
    const user = await User.findOneAndUpdate(
      { walletAddress },
      { isStaked },
      { new: true, upsert: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update stake status' });
  }
};

// POST /api/user/update-score
export const updateUserScore = async (req: Request, res: Response) => {
    const { walletAddress, kills, score } = req.body;
    try {
      // Find the user and update kills and score
      const user = await User.findOneAndUpdate(
        { walletAddress },
        { $set: { kills, score } },
        { new: true }
      );
  
      if (!user) {
        res.status(404).json({ error: 'User not found' });
      }
  
      // Return the updated user
      res.json(user);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update score and kills' });
    }
};  

export const setupUser = async (req: Request, res: Response) => {
    const { walletAddress, username } = req.body;
  
    if (!walletAddress || !username) {
        res.status(400).json({ error: 'walletAddress and username are required' });
    }
  
    try {
      // Check if the username is already used by another user
      const existingUsername = await User.findOne({ username });
      const existingWalletUser = await User.findOne({ walletAddress });
  
      if (existingUsername && (!existingWalletUser || existingUsername.walletAddress !== walletAddress)) {
        res.status(400).json({ error: 'Username already taken' });
      }
  
      // Upsert user
      const user = await User.findOneAndUpdate(
        { walletAddress },
        {
          $set: { username },
          $setOnInsert: { isStaked: false, kills: 0, score: 0, currentRoom: '' },
        },
        { new: true, upsert: true }
      );
  
      res.json(user);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to setup user' });
    }
  };


  export const updateCurrentRoom = async (req: Request, res: Response) => {
    const { walletAddress, currentRoom } = req.body;
  
    if (!walletAddress || !currentRoom) {
        res.status(400).json({ error: 'walletAddress and currentRoom are required' });
    }
  
    try {
      const user = await User.findOneAndUpdate(
        { walletAddress },
        { $set: { currentRoom } },
        { new: true }
      );
  
      if (!user) {
        res.status(404).json({ error: 'User not found' });
      }
  
      res.json({ message: 'Current room updated successfully', user });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update current room' });
    }
  };  

// GET /api/user/:walletAddress
export const getUser = async (req: Request, res: Response) => {
    const { walletAddress } = req.params;
    try {
      const user = await User.findOne({ walletAddress });
      if (!user) res.status(404).json({ error: 'User not found' });
      res.json(user);
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve user' });
    }
};  

// POST /api/room/join
export const joinRoom = async (req: Request, res: Response) => {
    const { roomId, walletAddress } = req.body;
    try {
      const room = await Room.findOneAndUpdate(
        { roomId },
        { $addToSet: { users: walletAddress } },
        { new: true, upsert: true }
      );
      res.json(room);
    } catch (err) {
      res.status(500).json({ error: 'Failed to join room' });
    }
};

// GET /api/room/:roomId
export const getRoom = async (req: Request, res: Response) => {
    const { roomId } = req.params;
    try {
      const room = await Room.findOne({ roomId });
      if (!room) res.status(404).json({ error: 'Room not found' });
      res.json(room);
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve room' });
    }
};

// POST /api/stake/history/add
export const addStakingData = async (req: Request, res: Response) => {
    const { walletAddress, amount } = req.body;
    try {
      const record = new StakingHistory({ walletAddress, amount });
      await record.save();
      res.json(record);
    } catch (err) {
      res.status(500).json({ error: 'Failed to save staking data' });
    }
};

// GET /api/stake/history/:walletAddress
export const getStakingData = async (req: Request, res: Response) => {
    const { walletAddress } = req.params;
    try {
      const history = await StakingHistory.find({ walletAddress }).sort({ timestamp: -1 });
      res.json(history);
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve staking data' });
    }
};

// GET /api/user/rooms-played/:walletAddress
export const getRoomsPlayedWithUsernames = async (req: Request, res: Response) => {
    const { walletAddress } = req.params;
  
    try {
      // Step 1: Find all rooms the user has joined
      const rooms = await Room.find({ users: walletAddress });
  
      if (!rooms || rooms.length === 0) {
        res.status(404).json({ error: 'No rooms found for this user' });
      }
  
      // Step 2: Collect all wallet addresses from those rooms
      const allWallets = new Set<string>();
      rooms.forEach(room => {
        room.users.forEach(user => allWallets.add(user));
      });
  
      // Step 3: Fetch usernames for those wallet addresses
      const walletList = Array.from(allWallets);
      const users = await User.find({ walletAddress: { $in: walletList } }, 'walletAddress username');
  
      // Step 4: Map walletAddress to username
      const addressToUsername: Record<string, string> = {};
      users.forEach(user => {
        addressToUsername[user.walletAddress] = user.username || 'Unknown';
      });
  
      // Step 5: Attach usernames to room users
      const enrichedRooms = rooms.map(room => ({
        roomId: room.roomId,
        users: room.users.map(addr => ({
          walletAddress: addr,
          username: addressToUsername[addr] || 'Unknown'
        }))
      }));
  
      res.json(enrichedRooms);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch rooms and usernames' });
    }
};

// GET /api/user/is-staked/:walletAddress
export const getUserStakeStatus = async (req: Request, res: Response) => {
    const { walletAddress } = req.params;
  
    try {
      const user = await User.findOne({ walletAddress });
  
      if (!user) {
        res.status(404).json({ error: 'User not found' });
      } else {
        res.json({ isStaked: user.isStaked });
      }
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve stake status' });
    }
};

// POST /api/leaderboard/add
export const addLeaderboardEntry = async (req: Request, res: Response) => {
    const { walletAddress, kills, score, roomId, username, gameTime } = req.body;
  
    try {
      const entry = new Leaderboard({ walletAddress, kills, score, roomId, username, gameTime });
      await entry.save();
      res.json(entry);
    } catch (err) {
      res.status(500).json({ error: 'Failed to add leaderboard entry' });
    }
  };
  
  // GET /api/leaderboard/wallet/:walletAddress
  export const getLeaderboardByWallet = async (req: Request, res: Response) => {
    const { walletAddress } = req.params;
  
    try {
      const entries = await Leaderboard.find({ walletAddress });
      res.json(entries);
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve leaderboard data by wallet address' });
    }
  };
  
  // GET /api/leaderboard/room/:roomId
  export const getLeaderboardByRoom = async (req: Request, res: Response) => {
    const { roomId } = req.params;
  
    try {
      const entries = await Leaderboard.find({ roomId });
      res.json(entries);
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve leaderboard data by room ID' });
    }
};