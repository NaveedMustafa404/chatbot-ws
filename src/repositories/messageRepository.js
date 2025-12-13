const { query, queryOne } = require('../db/queries');


const createMessage = async (roomId, userId, message) => {
  const sql = `
    INSERT INTO messages (room_id, user_id, message)
    VALUES (?, ?, ?)
  `;
  
  const result = await query(sql, [roomId, userId, message]);
  return result.insertId;
};


const findById = async (id) => {
  const sql = `
    SELECT m.id, m.room_id, m.user_id, m.message, m.created_at,
           u.username, u.email
    FROM messages m
    JOIN users u ON m.user_id = u.id
    WHERE m.id = ?
  `;
  
  return await queryOne(sql, [id]);
};


const getRoomMessages = async (roomId, limit = 50, offset = 0) => {
  const sql = `
    SELECT m.id, m.room_id, m.user_id, m.message, m.created_at,
           u.username, u.email
    FROM messages m
    JOIN users u ON m.user_id = u.id
    WHERE m.room_id = ?
    ORDER BY m.created_at DESC
    LIMIT ? OFFSET ?
  `;
  
  const messages = await query(sql, [roomId, limit, offset]);
  
  return messages.reverse();
};


const getLatestMessages = async (roomId, limit = 20) => {
  const sql = `
    SELECT m.id, m.room_id, m.user_id, m.message, m.created_at,
           u.username, u.email
    FROM messages m
    JOIN users u ON m.user_id = u.id
    WHERE m.room_id = ?
    ORDER BY m.created_at DESC
    LIMIT ?
  `;
  
  const messages = await query(sql, [roomId, limit]);
  return messages.reverse();
};


const getMessagesAfter = async (roomId, messageId) => {
  const sql = `
    SELECT m.id, m.room_id, m.user_id, m.message, m.created_at,
           u.username, u.email
    FROM messages m
    JOIN users u ON m.user_id = u.id
    WHERE m.room_id = ? AND m.id > ?
    ORDER BY m.created_at ASC
  `;
  
  return await query(sql, [roomId, messageId]);
};


const getMessagesBefore = async (roomId, messageId, limit = 50) => {
  const sql = `
    SELECT m.id, m.room_id, m.user_id, m.message, m.created_at,
           u.username, u.email
    FROM messages m
    JOIN users u ON m.user_id = u.id
    WHERE m.room_id = ? AND m.id < ?
    ORDER BY m.created_at DESC
    LIMIT ?
  `;
  
  const messages = await query(sql, [roomId, messageId, limit]);
  return messages.reverse();
};


const getMessageCount = async (roomId) => {
  const sql = `
    SELECT COUNT(*) as count
    FROM messages
    WHERE room_id = ?
  `;
  
  const result = await queryOne(sql, [roomId]);
  return result ? result.count : 0;
};


const deleteRoomMessages = async (roomId) => {
  const sql = `DELETE FROM messages WHERE room_id = ?`;
  const result = await query(sql, [roomId]);
  return result.affectedRows;
};


const deleteMessage = async (messageId, userId) => {
  const sql = `
    DELETE FROM messages 
    WHERE id = ? AND user_id = ?
  `;
  
  const result = await query(sql, [messageId, userId]);
  return result.affectedRows > 0;
};

module.exports = {
  createMessage,
  findById,
  getRoomMessages,
  getLatestMessages,
  getMessagesAfter,
  getMessagesBefore,
  getMessageCount,
  deleteRoomMessages,
  deleteMessage
};