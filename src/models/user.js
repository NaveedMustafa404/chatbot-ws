'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // User can create many rooms - one-to-many relationship
      User.hasMany(models.Room, {
        foreignKey: 'created_by',
        as: 'createdRooms'
      });
      
      // User belongs to many rooms through room_members - basically manytomany relationship
      User.belongsToMany(models.Room, {
        through: models.RoomMember,
        foreignKey: 'user_id',
        as: 'rooms'
      });
      
      // User has many messages - one-to-many relationship
      User.hasMany(models.Message, {
        foreignKey: 'user_id',
        as: 'messages'
      });
    }
  }
  
  User.init({
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [3, 50]
      }
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true
      }
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ['email'] },
      { fields: ['username'] }
    ]
  });
  
  return User;
};