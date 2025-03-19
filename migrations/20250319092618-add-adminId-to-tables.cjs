"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Tables", "adminId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "Admins",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Tables", "adminId");
  },
};
"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Tables", "adminId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "Admins",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Tables", "adminId");
  },
};

