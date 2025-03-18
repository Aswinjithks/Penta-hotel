const CategoryModel = (sequelize, DataTypes) => {
  const Category = sequelize.define("Category", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Category name cannot be empty" },
      },
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: { msg: "Image must be a valid URL" },
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
  });

  Category.associate = (models) => {
    Category.belongsTo(models.User, { foreignKey: "userId" });
    Category.hasMany(models.FoodItem);
  };

  return Category;
};

export default CategoryModel;
