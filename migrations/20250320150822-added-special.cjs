module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn("FoodItems", "special", {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("FoodItems", "special");
  },
};
