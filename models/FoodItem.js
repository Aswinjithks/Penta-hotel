const FoodItemModel = (sequelize, DataTypes) => {
  const FoodItem = sequelize.define("FoodItem", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Food item name cannot be empty",
        },
      },
    },
    time: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Time cannot be empty",
        },
      },
    },
    enable_quantity_options: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    quarter_price: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: {
        isFloat: {
          msg: "Quarter price must be a valid number",
        },
        min: {
          args: [0],
          msg: "Price cannot be negative",
        },
      },
    },
    half_price: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: {
        isFloat: {
          msg: "Half price must be a valid number",
        },
        min: {
          args: [0],
          msg: "Price cannot be negative",
        },
      },
    },
    full_price: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: {
        isFloat: {
          msg: "Full price must be a valid number",
        },
        min: {
          args: [0],
          msg: "Price cannot be negative",
        },
      },
    },
    offer: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        isFloat: {
          msg: "Price must be a valid number",
        },
        min: {
          args: [0],
          msg: "Price cannot be negative",
        },
      },
    },
    available: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    special: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    popular: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    new_arrival: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    adminId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Admins",
        key: "id",
      },
      validate: {
        isInt: {
          msg: "Admin ID must be an integer",
        },
      },
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Categories",
        key: "id",
      },
      validate: {
        isInt: {
          msg: "Category ID must be an integer",
        },
      },
    },
  });

  FoodItem.associate = (models) => {
    FoodItem.belongsTo(models.Category, {
      foreignKey: "categoryId",
      as: "category",
    });
    FoodItem.belongsTo(models.Admin, { foreignKey: "adminId", as: "admin" });
  };

  return FoodItem;
};

export default FoodItemModel;
