const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const ClosedPosition = sequelize.define(
  'closed_position',
  {
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
    close_price: {
      type: Sequelize.DOUBLE,
      allowNull: false,
      defaultValue: 0.0,
    },
    profit: {
      type: Sequelize.DOUBLE,
      allowNull: false,
      defaultValue: 0.0,
    },
    percent_profit: {
      type: Sequelize.DOUBLE,
      allowNull: false,
      defaultValue: 0.0,
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    closedAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = ClosedPosition;
