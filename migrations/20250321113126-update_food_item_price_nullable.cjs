module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("FoodItems", "price", {
      type: Sequelize.FLOAT,
      allowNull: true, // Making it nullable at the database level
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("FoodItems", "price", {
      type: Sequelize.FLOAT,
      allowNull: false, // Reverting back to NOT NULL in case of rollback
    });
  },
};
