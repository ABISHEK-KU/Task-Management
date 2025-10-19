import User from '../models/User.js';

// Get all users for assignment dropdown
const getUsers = async (req, res) => {
  try {
    const users = await User.find({ isActive: true }, '_id username firstName lastName email');
    res.json(users);
  } catch (error) {
    console.error('Error retrieving users:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export default {
  getUsers
};
