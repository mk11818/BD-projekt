const Sequelize = require('sequelize');

const sequelize = new Sequelize('stock-market', 'root', 'root', {
  dialect: 'mysql',
  host: 'localhost',
});

module.exports = sequelize;
