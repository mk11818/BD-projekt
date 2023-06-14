const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Wallet = sequelize.define(
  'wallet',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    value: {
      type: Sequelize.DOUBLE,
      allowNull: false,
      defaultValue: 0.0,
    },
    currency: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'PLN',
    },
  },
  {
    timestamps: false,
  }
);

module.exports = Wallet;
