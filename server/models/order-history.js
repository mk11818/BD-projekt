const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const OrderHistory = sequelize.define(
  'order_history',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    order_no: {
      type: Sequelize.INTEGER,
      allowNull: false,
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
    price: {
      type: Sequelize.DOUBLE,
      allowNull: false,
      defaultValue: 0.0,
    },
    quoteBuy: {
      type: Sequelize.DOUBLE,
      allowNull: false,
      defaultValue: 0.0,
    },
    quoteSell: {
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
    result: {
      type: Sequelize.ENUM('realised', 'cancelled'),
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = OrderHistory;
