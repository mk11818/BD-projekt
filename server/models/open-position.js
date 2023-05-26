const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const OpenPosition = sequelize.define('open_positions', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  type: {
    type: Sequelize.ENUM('buy', 'sell'),
    allowNull: false,
  },
  value: {
    type: Sequelize.DOUBLE,
    allowNull: false,
    defaultValue: 0.0,
  },
  profit: {
    type: Sequelize.DOUBLE,
    allowNull: false,
    defaultValue: 0.0,
  },
  change: {
    type: Sequelize.DOUBLE,
    allowNull: false,
    defaultValue: 0.0,
  },
});

module.exports = OpenPosition;