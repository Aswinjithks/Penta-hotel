const TableModel = (sequelize, DataTypes) => {
    const Table = sequelize.define("Table", {
      number: { 
        type: DataTypes.INTEGER, 
        allowNull: false, 
        unique: true,
        validate: {
          isInt: {
            msg: "Table number must be an integer"
          },
          min: {
            args: [1],
            msg: "Table number must be positive"
          }
        }
      },
      token: { 
        type: DataTypes.STRING, 
        allowNull: false, 
        unique: true 
      },
      qr_code_url: { 
        type: DataTypes.TEXT, 
        allowNull: true 
      },
    });
  
    Table.associate = (models) => {
      Table.hasMany(models.Order);
    };
  
    return Table;
  };
  
  export default TableModel;