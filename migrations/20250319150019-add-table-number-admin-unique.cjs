module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addIndex("Tables", ["number", "adminId"], {
      unique: true,
      name: "unique_table_per_admin",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex("Tables", "unique_table_per_admin");
  },
};
