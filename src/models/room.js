'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Room extends Model {
    static associate(models) {
      // Room belongs to a creator (User)
      Room.belongsTo(models.User, {
        foreignKey: 'created_by',
        as: 'creator'
      });
      
      // Room has many members through room_members
      Room.belongsToMany(models.User, {
        through: models.RoomMember,
        foreignKey: 'room_id',
        as: 'members'
      });
      
      // Room has many messages
      Room.hasMany(models.Message, {
        foreignKey: 'room_id',
        as: 'messages'
      });
    }
  }
  
  Room.init({
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100]
      }
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Room',
    tableName: 'rooms',
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ['created_by'] }
    ]
  });
  
  return Room;
};