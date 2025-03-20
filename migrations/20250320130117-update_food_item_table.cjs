module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("FoodItems", "half_price", {
        type: Sequelize.FLOAT,
        allowNull: true,
      }),
      queryInterface.addColumn("FoodItems", "full_price", {
        type: Sequelize.FLOAT,
        allowNull: true,
      }),
      queryInterface.addColumn("FoodItems", "offer", {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn("FoodItems", "description", {
        type: Sequelize.TEXT,
        allowNull: true,
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("FoodItems", "time"),
      queryInterface.removeColumn("FoodItems", "enable_quantity_options"),
      queryInterface.removeColumn("FoodItems", "quarter_price"),
      queryInterface.removeColumn("FoodItems", "half_price"),
      queryInterface.removeColumn("FoodItems", "full_price"),
      queryInterface.removeColumn("FoodItems", "offer"),
      queryInterface.removeColumn("FoodItems", "description"),
    ]);
  },
};
