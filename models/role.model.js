let { DataTypes, sequelize } = require('../lib/');
let role = sequelize.define('role', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = {
  role,
};
