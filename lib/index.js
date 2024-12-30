let sq = require('sequelize');
let sequelize = new sq.Sequelize({
  dialect: 'sqlite',
  storage: './database.sql',
});
module.exports = { DataTypes: sq.DataTypes, sequelize };
