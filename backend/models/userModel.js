const pool = require('../config/db');

async function createUser(username, email, hashedPassword) {
  const [result] = await pool.query(
    'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
    [username, email, hashedPassword]
  );
  return result.insertId;
}

async function getUserByEmailOrUsername(identifier) {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE email = ? OR username = ?',
    [identifier, identifier]
  );
  return rows[0];
}

async function getUserById(id) {
  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0];
}

async function getUserByUsername(username) {
  const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
  return rows[0];
}

async function updateUserProfile(userId, { username, email }) {
  const [result] = await pool.query(
    'UPDATE users SET username = ?, email = ? WHERE id = ?',
    [username, email, userId]
  );

  if (result.affectedRows === 0) {
    return null;
  }

  return getUserById(userId);
}

module.exports = { createUser, getUserByEmailOrUsername, getUserById, getUserByUsername, updateUserProfile };
