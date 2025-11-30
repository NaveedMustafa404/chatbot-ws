'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    static associate(models) {
      // Message belongs to Room
      Message.belongsTo(models.Room, {
        foreignKey: 'room_id'
      });
      
      // Message belongs to User
      Message.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'sender'
      });
    }
  }
  
  Message.init({
    room_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'rooms',
        key: 'id'
      }
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    }
  }, {
    sequelize,
    modelName: 'Message',
    tableName: 'messages',
    underscored: true,
    timestamps: true,
    updatedAt: false,
    indexes: [
      { fields: ['room_id', 'created_at'] },
      { fields: ['user_id'] }
    ]
  });
  
  return Message;
};