module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn("FoodItems", "popular", {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    }).then(() => {
      return queryInterface.addColumn("FoodItems", "new_arrival", {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      });
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("FoodItems", "popular").then(() => {
      return queryInterface.removeColumn("FoodItems", "new_arrival");
    });
  }
};
