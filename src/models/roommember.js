'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class RoomMember extends Model {
    static associate(models) {
      // RoomMember belongs to Room - many-to-one relationship
      RoomMember.belongsTo(models.Room, {
        foreignKey: 'room_id'
      });
      
      // RoomMember belongs to User - many-to-one relationship
      RoomMember.belongsTo(models.User, {
        foreignKey: 'user_id'
      });
    }
  }
  
  RoomMember.init({
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
    }
  }, {
    sequelize,
    modelName: 'RoomMember',
    tableName: 'room_members',
    underscored: true,
    timestamps: true,
    createdAt: 'joined_at',
    updatedAt: false,
    indexes: [
      { 
        unique: true, 
        fields: ['room_id', 'user_id'],
        name: 'unique_room_user'
      },
      { fields: ['room_id'] },
      { fields: ['user_id'] }
    ]
  });
  
  return RoomMember;
};