const { Op } = require('sequelize');

const Company = require('../models/company');
const Order = require('../models/order');
const Quote = require('../models/quote');
const User = require('../models/user');
const OpenPosition = require('../models/open-position');
const ClosedPosition = require('../models/closed-position');

exports.getQuotes = (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = +req.query.limit || 5;
  const search = req.query.search || '';
  const sortBy = req.query.sortBy;
  const desc = req.query.desc;
  Quote.findAndCountAll({
    include: {
      model: Company,
      where: {
        symbol: {
          [Op.like]: search + '%',
        },
      },
    },
    offset: currentPage * perPage,
    limit: perPage,
    order: sortBy ? [[sortBy, desc === 'true' ? 'DESC' : 'ASC']] : [],
  })
    .then((quotes) => {
      if (!quotes) {
        const error = new Error('Quotes could not be found.');
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({
        message: 'Quotes fetched.',
        quotes: quotes.rows,
        totalRow: quotes.count,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getQuote = (req, res, next) => {
  Quote.findByPk(req.params.id, { include: Company })
    .then((quote) => {
      if (!quote) {
        const error = new Error('Quote could not be found.');
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ message: 'Quote fetched.', quote: quote });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.createOrder = (req, res, next) => {
  const order = req.body.order;

  let fetchedQuote;

  User.findByPk(req.userId)
    .then((user) => {
      return user.getWallet();
    })
    .then((wallet) => {
      if (order.type === 'buy') {
        wallet.value = wallet.value - +(order.value * 4.17).toFixed(2);
      } else {
        wallet.value = wallet.value + +(order.value * 4.17).toFixed(2);
      }

      return wallet.save();
    })
    .then((result) => {
      // console.log(result);
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });

  Quote.findByPk(order.quoteId)
    .then((quote) => {
      fetchedQuote = quote;
      return quote.createOrder({
        type: order.type,
        value: order.value,
        rate: order.rate,
        amount: order.amount,
        userId: req.userId,
      });
    })
    .then((result) => {
      res
        .status(201)
        .json({ message: 'Order created succesfully.', order: result });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getOrders = (req, res, next) => {
  Order.findAll({ include: [{ model: Quote, include: [Company] }] })
    .then((orders) => {
      if (!orders) {
        const error = new Error('Orders could not be found.');
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ message: 'Orders fetched.', orders: orders });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.deleteOrder = (req, res, next) => {
  const order = req.body.order;
  User.findByPk(req.userId)
    .then((user) => {
      return user.getWallet();
    })
    .then((wallet) => {
      wallet.value = wallet.value + +(order.value * 4.17).toFixed(2);
      return wallet.save();
    })
    .then((result) => {
      // console.log(result);
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });

  Order.findOne({ where: { id: order.id } })
    .then((order) => {
      if (!order) {
        const error = new Error('Order could not be found.');
        error.statusCode = 404;
        throw error;
      }
      return order.destroy();
    })
    .then((result) => {
      res.status(200).json({ message: 'Order deleted.', result: result });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getOpenPositions = (req, res, next) => {
  OpenPosition.findAll({ include: [{ model: Quote, include: [Company] }] })
    .then((positions) => {
      if (!positions) {
        const error = new Error('Open positions could not be found.');
        error.statusCode = 404;
        throw error;
      }
      res
        .status(200)
        .json({ message: 'Orders fetched.', positions: positions });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getClosedPositions = (req, res, next) => {
  ClosedPosition.findAll({ include: [{ model: Quote, include: [Company] }] })
    .then((positions) => {
      if (!positions) {
        const error = new Error('Open positions could not be found.');
        error.statusCode = 404;
        throw error;
      }
      res
        .status(200)
        .json({ message: 'Orders fetched.', positions: positions });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
