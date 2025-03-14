const AdminModel = (sequelize, DataTypes) => {
    const Admin = sequelize.define("Admin", {
      username: { 
        type: DataTypes.STRING, 
        allowNull: false, 
        unique: true,
        validate: {
          notEmpty: {
            msg: "Username cannot be empty"
          }
        }
      },
      password_hash: { 
        type: DataTypes.STRING, 
        allowNull: false 
      },
    });
  
    return Admin;
  };
  
  export default AdminModel;