'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('room_members', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      room_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'rooms',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      joined_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('room_members', ['room_id', 'user_id'], {
      unique: true,
      name: 'unique_room_user'
    });
    await queryInterface.addIndex('room_members', ['room_id']);
    await queryInterface.addIndex('room_members', ['user_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('room_members');
  }
};