module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("FoodItems", "CategoryId");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("FoodItems", "CategoryId", {
      type: Sequelize.INTEGER,
      allowNull: true, // Change this if it was NOT NULL before
      references: {
        model: "Categories",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },
};
