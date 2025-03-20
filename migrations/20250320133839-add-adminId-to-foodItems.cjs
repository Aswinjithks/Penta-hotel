"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn("FoodItems", "adminId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1, 
      references: {
        model: "Admins", 
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("FoodItems", "adminId");
  },
};
