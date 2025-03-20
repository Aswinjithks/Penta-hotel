// migration file - update-table-uniqueness.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove the existing unique constraint on the number column
    await queryInterface.removeConstraint('Tables', 'Tables_number_key');
    
    // Add the new composite unique constraint
    await queryInterface.addConstraint('Tables', {
      fields: ['number', 'adminId'],
      type: 'unique',
      name: 'table_number_admin_unique'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the composite unique constraint
    await queryInterface.removeConstraint('Tables', 'table_number_admin_unique');
    
    // Add back the original unique constraint on number
    await queryInterface.addConstraint('Tables', {
      fields: ['number'],
      type: 'unique',
      name: 'Tables_number_key'
    });
  }
};