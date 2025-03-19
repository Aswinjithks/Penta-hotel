const CategoryModel = (sequelize, DataTypes) => {
  const Category = sequelize.define("Category", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Category name cannot be empty",
        },
      },
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: {
          msg: "Image must be a valid URL",
        },
      },
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

  Category.associate = (models) => {
    Category.belongsTo(models.Admin, { foreignKey: "adminId" });
    Category.hasMany(models.FoodItem);
  };

  return Category;
};

export default CategoryModel;
