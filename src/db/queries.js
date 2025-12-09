const pool = require('../config/database');


// By using this we Execute a query (SELECT, INSERT, UPDATE, DELETE)

const query = async (sql, params = []) => {
  const [rows] = await pool.execute(sql, params);
  return rows;
};


// By using this we Get single row

const queryOne = async (sql, params = []) => {
  const [rows] = await pool.execute(sql, params);
  return rows[0] || null;
};


// By using this we Execute transaction

const transaction = async (callback) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  query,
  queryOne,
  transaction
};