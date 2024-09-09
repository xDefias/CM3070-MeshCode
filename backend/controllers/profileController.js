const { getUserById, updateUserProfile } = require('../models/userModel');
const createResponse = require('../utils/response');

async function getProfile(req, res) {
  try {
    const userId = req.user.userId;
    const user = await getUserById(userId);

    if (!user) {
      return res.status(404).json(createResponse(false, {}, 'User not found'));
    }

    res.status(200).json(createResponse(true, user, null));
  } catch (error) {
    res.status(500).json(createResponse(false, {}, 'Internal server error'));
  }
}

async function updateProfile(req, res) {
  try {
    const userId = req.user.userId; 
    const { username, email } = req.body;

    const updatedUser = await updateUserProfile(userId, { username, email });

    if (!updatedUser) {
      return res.status(404).json(createResponse(false, {}, 'User not found'));
    }

    res.status(200).json(createResponse(true, updatedUser, null));
  } catch (error) {
    res.status(500).json(createResponse(false, {}, 'Internal server error'));
  }
}

module.exports = { getProfile, updateProfile };
