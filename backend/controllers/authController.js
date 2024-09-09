const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createUser, getUserByEmailOrUsername } = require('../models/userModel');
const createResponse = require('../utils/response');

const JWT_SECRET = process.env.JWT_SECRET;

async function register(req, res) {
  //console.log("REGISTER API HIT")
  const { username, email, password } = req.body;

  try {
    const existingUser = await getUserByEmailOrUsername(email);
    if (existingUser) {
      return res.status(400).json(createResponse(false, {}, 'Email already in use'));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await createUser(username, email, hashedPassword);

    res.status(201).json(createResponse(true, { userId }, null));
  } catch (error) {
    res.status(500).json(createResponse(false, {}, 'Internal server error'));
  }
}

async function login(req, res) {
  //console.log("LOGIN API HIT")
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json(createResponse(false, {}, 'Please provide both username/email and password'));
  }

  try {
    const user = await getUserByEmailOrUsername(identifier);
    if (!user) {
      return res.status(400).json(createResponse(false, {}, 'Invalid email/username or password'));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json(createResponse(false, {}, 'Invalid email/username or password'));
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });

    res.status(200).json(createResponse(true, { token }, null));
  } catch (error) {
    res.status(500).json(createResponse(false, {}, 'Internal server error'));
  }
}

module.exports = { register, login };
