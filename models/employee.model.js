let { DataTypes, sequelize } = require('../lib/');
let employee = sequelize.define('employee', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true, // Ensures the email is in a valid format
    },
  },
});

module.exports = {
  employee,
};
