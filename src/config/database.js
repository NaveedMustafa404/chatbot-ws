require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    pool: {
      max: parseInt(process.env.DB_CONNECTION_LIMIT),
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    logging: false // Set to console.log to see SQL queries
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    pool: {
      max: parseInt(process.env.DB_CONNECTION_LIMIT),
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    logging: false
  }
};