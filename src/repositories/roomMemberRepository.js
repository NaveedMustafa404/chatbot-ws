const { query, queryOne } = require('../db/queries');


const addMember = async (roomId, userId) => {
  const sql = `
    INSERT INTO room_members (room_id, user_id)
    VALUES (?, ?)
  `;
  
  try {
    const result = await query(sql, [roomId, userId]);
    return result.insertId;
  } catch (error) {
    // Check if duplicate entry error (user already in room)
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error('User is already a member of this room');
    }
    throw error;
  }
};


const removeMember = async (roomId, userId) => {
  const sql = `
    DELETE FROM room_members
    WHERE room_id = ? AND user_id = ?
  `;
  
  const result = await query(sql, [roomId, userId]);
  return result.affectedRows > 0;
};


const isMember = async (roomId, userId) => {
  const sql = `
    SELECT id FROM room_members
    WHERE room_id = ? AND user_id = ?
  `;
  
  const result = await queryOne(sql, [roomId, userId]);
  return result !== null;
};


const getRoomMembers = async (roomId) => {
  const sql = `
    SELECT rm.id, rm.joined_at,
           u.id as user_id, u.username, u.email
    FROM room_members rm
    JOIN users u ON rm.user_id = u.id
    WHERE rm.room_id = ?
    ORDER BY rm.joined_at ASC
  `;
  
  return await query(sql, [roomId]);
};


const getMemberCount = async (roomId) => {
  const sql = `
    SELECT COUNT(*) as count
    FROM room_members
    WHERE room_id = ?
  `;
  
  const result = await queryOne(sql, [roomId]);
  return result ? result.count : 0;
};


const getUserMemberships = async (userId) => {
  const sql = `
    SELECT rm.room_id, rm.joined_at,
           r.name as room_name, r.created_by
    FROM room_members rm
    JOIN rooms r ON rm.room_id = r.id
    WHERE rm.user_id = ?
    ORDER BY rm.joined_at DESC
  `;
  
  return await query(sql, [userId]);
};


const removeAllMembers = async (roomId) => {
  const sql = `
    DELETE FROM room_members
    WHERE room_id = ?
  `;
  
  const result = await query(sql, [roomId]);
  return result.affectedRows;
};

module.exports = {
  addMember,
  removeMember,
  isMember,
  getRoomMembers,
  getMemberCount,
  getUserMemberships,
  removeAllMembers
};