let { DataTypes, sequelize } = require('../lib/');
let { employee } = require('./employee.model');
let { role } = require('./role.model');
let employeeRole = sequelize.define('employeeRole', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  employeeId: {
    type: DataTypes.INTEGER,
    references: {
      model: employee,
      key: 'id',
    },
  },
  roleId: {
    type: DataTypes.INTEGER,
    references: {
      model: role,
      key: 'id',
    },
  },
});
employee.belongsToMany(role, { through: employeeRole });
role.belongsToMany(employee, { through: employeeRole });
module.exports = {
  employeeRole,
};
