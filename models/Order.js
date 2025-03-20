const OrderModel = (sequelize, DataTypes) => {
  const Order = sequelize.define("Order", {
    status: {
      type: DataTypes.ENUM("pending", "processing", "completed", "cancelled"),
      allowNull: false,
      defaultValue: "pending",
    },
    items: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Items cannot be empty",
        },
      },
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    number: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    adminId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  });

  Order.associate = (models) => {
    Order.belongsTo(models.Table, { foreignKey: "TableId" });
  };

  return Order;
};

export default OrderModel;
