const { query, queryOne} = require('../db/queries');
const bcrypt = require("bcrypt");


const createUser = async (username, email, password) => {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const sql = 'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)';
    const result = await query(sql, [username, email, password_hash]);
    return result.insertId;
    
};

const findByEmail = async (email) => {
  const sql = `
    SELECT id, username, email, password_hash, created_at, updated_at
    FROM users
    WHERE email = ?
  `;
  
  return await queryOne(sql, [email]);
};

const findByUsername = async (username) => {
  const sql = `
    SELECT id, username, email, password_hash, created_at, updated_at
    FROM users
    WHERE username = ?
  `;
  
  return await queryOne(sql, [username]);
};

const findAll = async () => {
  const sql = `
    SELECT * FROM users
    
  `;
  
  return await query(sql);
};

const findById = async (id) => {
  const sql = `
    SELECT id, username, email, password_hash, created_at, updated_at
    FROM users
    WHERE id = ?
  `;
  
  return await queryOne(sql, [id]);
};

const comparePassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

const getSafeUser = (user) => {
  if (!user) return null;

  const { password_hash, ...safeUser } = user;
  return safeUser;
};

const updateUser = async (id, updates) => {
  const fields = [];
  const values = [];
  
  if (updates.username) {
    fields.push('username = ?');
    values.push(updates.username);
  }
  if (updates.email) {
    fields.push('email = ?');
    values.push(updates.email);
  }
  
  if (fields.length === 0) return false;
  
  values.push(id);
  const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
  
  const result = await query(sql, values);
  return result.affectedRows > 0;
};

const deleteUser = async (id) => {
  const sql = `DELETE FROM users WHERE id = ?`;
  const result = await query(sql, [id]);
  return result.affectedRows > 0;
};

module.exports = {
  createUser,
  findByEmail,
  findByUsername,
  findById,
  findAll,
  comparePassword,
  getSafeUser,
  updateUser,
  deleteUser
};