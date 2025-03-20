module.exports = {
  up: async (queryInterface, Sequelize) => {
    const indexes = await queryInterface.showIndex("Tables");

    const indexExists = indexes.some(index =>
      index.name === "unique_table_per_admin"
    );

    if (!indexExists) {
      await queryInterface.addIndex("Tables", ["number", "adminId"], {
        unique: true,
        name: "unique_table_per_admin",
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex("Tables", "unique_table_per_admin");
  },
};
