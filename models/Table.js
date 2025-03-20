const TableModel = (sequelize, DataTypes) => {
  const Table = sequelize.define("Table", {
    number: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: {
          msg: "Table number must be an integer",
        },
        min: {
          args: [1],
          msg: "Table number must be positive",
        },
      },
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: {
          msg: "Table capacity must be an integer",
        },
        min: {
          args: [1],
          msg: "Table capacity must be positive",
        },
      },
    },
    table_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Table name is required",
        },
      },
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    qr_code_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    adminId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Admins",
        key: "id",
      },
      onDelete: "CASCADE",
    },
  });

  Table.addHook("afterDefine", () => {
    Table.addIndex(["number", "adminId"], {
      unique: true,
      name: "table_number_admin_unique",
    });
  });

  Table.associate = (models) => {
    Table.hasMany(models.Order);
    Table.belongsTo(models.Admin, { foreignKey: "adminId" });
  };

  return Table;
};

export default TableModel;
