let { DataTypes, sequelize } = require('../lib/');
let { employee } = require('./employee.model');
let { department } = require('./department.model');
let employeeDepartment = sequelize.define('employeeDepartment', {
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
  departmentId: {
    type: DataTypes.INTEGER,
    references: {
      model: department,
      key: 'id',
    },
  },
});
employee.belongsToMany(department, { through: employeeDepartment });
department.belongsToMany(employee, { through: employeeDepartment });
module.exports = {
  employeeDepartment,
};
