const { query, queryOne, transaction } = require('../db/queries');

const createRoom = async (name, createdBy) => {
  const sql = `
    INSERT INTO rooms (name, created_by)
    VALUES (?, ?)
  `;
  
  const result = await query(sql, [name, createdBy]);
  return result.insertId;
};

const findById = async (id) => {
  const sql = `
    SELECT r.id, r.name, r.created_by, r.created_at, r.updated_at,
           u.username as creator_username, u.email as creator_email
    FROM rooms r
    JOIN users u ON r.created_by = u.id
    WHERE r.id = ?
  `;
  
  return await queryOne(sql, [id]);
};

const findAll = async () => {
  const sql = `
    SELECT r.id, r.name, r.created_by, r.created_at, r.updated_at,
           u.username as creator_username,
           COUNT(rm.id) as member_count
    FROM rooms r
    JOIN users u ON r.created_by = u.id
    LEFT JOIN room_members rm ON r.id = rm.room_id
    GROUP BY r.id
    ORDER BY r.created_at DESC
  `;
  
  return await query(sql);
};

const findByCreator = async (userId) => {
  const sql = `
    SELECT r.id, r.name, r.created_by, r.created_at, r.updated_at,
           COUNT(rm.id) as member_count
    FROM rooms r
    LEFT JOIN room_members rm ON r.id = rm.room_id
    WHERE r.created_by = ?
    GROUP BY r.id
    ORDER BY r.created_at DESC
  `;
  
  return await query(sql, [userId]);
};

const findUserRooms = async (userId) => {
  const sql = `
    SELECT r.id, r.name, r.created_by, r.created_at,
           u.username as creator_username,
           rm.joined_at,
           COUNT(DISTINCT rm2.id) as member_count
    FROM room_members rm
    JOIN rooms r ON rm.room_id = r.id
    JOIN users u ON r.created_by = u.id
    LEFT JOIN room_members rm2 ON r.id = rm2.room_id
    WHERE rm.user_id = ?
    GROUP BY r.id, rm.joined_at
    ORDER BY rm.joined_at DESC
  `;
  
  return await query(sql, [userId]);
};

const updateRoom = async (id, name) => {
  const sql = `
    UPDATE rooms 
    SET name = ?
    WHERE id = ?
  `;
  
  const result = await query(sql, [name, id]);
  return result.affectedRows > 0;
};

const deleteRoom = async (id) => {
  const sql = `DELETE FROM rooms WHERE id = ?`;
  const result = await query(sql, [id]);
  return result.affectedRows > 0;
};

const isRoomCreator = async (roomId, userId) => {
  const sql = `
    SELECT id FROM rooms 
    WHERE id = ? AND created_by = ?
  `;
  
  const result = await queryOne(sql, [roomId, userId]);
  return result !== null;
};

module.exports = {
  createRoom,
  findById,
  findAll,
  findByCreator,
  findUserRooms,
  updateRoom,
  deleteRoom,
  isRoomCreator
};