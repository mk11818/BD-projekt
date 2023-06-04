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
  volume: {
    type: Sequelize.DOUBLE,
    allowNull: false,
    defaultValue: 0,
  },
  value: {
    type: Sequelize.DOUBLE,
    allowNull: false,
    defaultValue: 0.0,
  },
  open_price: {
    type: Sequelize.DOUBLE,
    allowNull: false,
    defaultValue: 0.0,
  },
});

module.exports = OpenPosition;
