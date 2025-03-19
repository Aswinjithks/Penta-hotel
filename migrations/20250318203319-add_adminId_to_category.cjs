module.exports = {
  async up(queryInterface, Sequelize) {
    // Step 1: Add the column as NULLABLE first
    await queryInterface.addColumn("Categories", "adminId", {
      type: Sequelize.UUID,
      allowNull: true, // Initially allow NULL to prevent errors
      references: {
        model: "Admins",
        key: "id",
      },
      onDelete: "CASCADE",
    });

    // Step 2: Assign a default adminId (Ensure valid UUID exists)
    await queryInterface.sequelize.query(
      `UPDATE "Categories" SET "adminId" = (SELECT id FROM "Admins" LIMIT 1) WHERE "adminId" IS NULL;`
    );

    // Step 3: Change column to NOT NULL
    await queryInterface.changeColumn("Categories", "adminId", {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: "Admins",
        key: "id",
      },
      onDelete: "CASCADE",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Categories", "adminId");
  },
};
