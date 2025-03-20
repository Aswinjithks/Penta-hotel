'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Tables', 'capacity', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1, // Temporary default value for existing records
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert changes if needed
    await queryInterface.removeColumn('Tables', 'capacity');
  }
};