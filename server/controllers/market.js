const Company = require('../models/company');
const Quote = require('../models/quote');

exports.getQuotes = (req, res, next) => {
  Quote.findAll({ include: Company })
    .then((quotes) => {
      if (!quotes) {
        const error = new Error('Quotes could not be found.');
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ message: 'Quotes fetched.', quotes: quotes });
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
