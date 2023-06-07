const { Op, or } = require('sequelize');

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

  Quote.findByPk(order.quoteId)
    .then((quote) => {
      return quote.createOrder({
        type: order.type,
        volume: order.volume,
        value: order.value,
        price: order.price,
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
  const currentPage = req.query.page || 1;
  const perPage = +req.query.limit || 5;
  const search = req.query.search || '';
  const sortBy = req.query.sortBy;
  const desc = req.query.desc;

  Order.findAndCountAll({
    where: { userId: req.userId },
    include: [
      {
        model: Quote,
        include: {
          model: Company,
          where: {
            symbol: {
              [Op.like]: search + '%',
            },
          },
        },
      },
    ],
    offset: currentPage * perPage,
    limit: perPage,
    order: sortBy ? [[sortBy, desc === 'true' ? 'DESC' : 'ASC']] : [],
  })
    .then((orders) => {
      if (!orders) {
        const error = new Error('Orders could not be found.');
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({
        message: 'Orders fetched.',
        orders: orders.rows,
        totalRow: orders.count,
      });
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
  console.log(order);

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
  const currentPage = req.query.page || 1;
  const perPage = +req.query.limit || 5;
  const search = req.query.search || '';
  const sortBy = req.query.sortBy;
  const desc = req.query.desc;

  OpenPosition.findAndCountAll({
    where: { userId: req.userId },
    include: [
      {
        model: Quote,
        include: {
          model: Company,
          where: {
            symbol: {
              [Op.like]: search + '%',
            },
          },
        },
      },
    ],
    offset: currentPage * perPage,
    limit: perPage,
    order: sortBy ? [[sortBy, desc === 'true' ? 'DESC' : 'ASC']] : [],
  })
    .then((positions) => {
      if (!positions) {
        const error = new Error('Open positions could not be found.');
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({
        message: 'Open positions fetched.',
        positions: positions.rows,
        totalRow: positions.count,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getOpenPosition = (req, res, next) => {
  OpenPosition.findByPk(req.params.id, {
    include: [
      {
        model: Quote,
        include: [Company],
      },
    ],
  })
    .then((position) => {
      if (!position) {
        const error = new Error('Open position could not be found.');
        error.statusCode = 404;
        throw error;
      }
      res
        .status(200)
        .json({ message: 'Open position fetched.', position: position });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getClosedPositions = (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = +req.query.limit || 5;
  const search = req.query.search || '';
  const sortBy = req.query.sortBy;
  const desc = req.query.desc;

  ClosedPosition.findAndCountAll({
    where: { userId: req.userId },
    include: [
      {
        model: Quote,
        include: {
          model: Company,
          where: {
            symbol: {
              [Op.like]: search + '%',
            },
          },
        },
      },
    ],
    offset: currentPage * perPage,
    limit: perPage,
    order: sortBy ? [[sortBy, desc === 'true' ? 'DESC' : 'ASC']] : [],
  })
    .then((positions) => {
      if (!positions) {
        const error = new Error('Closed positions could not be found.');
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({
        message: 'Closed positions fetched.',
        positions: positions.rows,
        totalRow: positions.count,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
