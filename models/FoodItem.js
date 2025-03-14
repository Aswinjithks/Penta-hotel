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
    image_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });

  FoodItem.associate = (models) => {
    FoodItem.belongsTo(models.Category);
  };

  return FoodItem;
};

export default FoodItemModel;
