const express = require('express');
const bodyParser = require('body-parser');
const cron = require('node-cron');
const bcrypt = require('bcryptjs');
const finnhub = require('finnhub');

const sequelize = require('./util/database');

const authRoutes = require('./routes/auth');
const marketRoutes = require('./routes/market');
const paymentRoutes = require('./routes/payment');

const User = require('./models/user');
const Wallet = require('./models/wallet');
const DepositHistory = require('./models/deposit-history');
const Company = require('./models/company');
const Quote = require('./models/quote');
const Order = require('./models/order');
const OpenPosition = require('./models/open-position');
const ClosedPosition = require('./models/closed-position');

const api_key = finnhub.ApiClient.instance.authentications['api_key'];
api_key.apiKey = 'chdimu1r01qk9rb2k220chdimu1r01qk9rb2k22g'; // Replace this
const finnhubClient = new finnhub.DefaultApi();

const symbols = [
  'TSLA',
  'META',
  'FL',
  'NFLX',
  'NIO',
  'PLUG',
  'SPCE',
  'PLTR',
  'AMD',
  'BABA',
  'NVDA',
  'AAPL',
  'NKE',
  'CGC',
  'MSFT',
  'ZM',
  'SNAP',
  'DIS',
  'SBUX',
];

const app = express();

app.use(bodyParser.json());

// CORS errors disabled for req
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// app.get('/message', (req, res) => {
//   res.json({ message: 'Hello from server!' });
// });

app.use('/auth', authRoutes);
app.use(marketRoutes);
app.use(paymentRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

User.hasOne(Wallet);
Wallet.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(DepositHistory);
DepositHistory.belongsTo(User);

Company.hasMany(Quote);
Quote.belongsTo(Company);

User.hasMany(Order);
Order.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
Quote.hasMany(Order);
Order.belongsTo(Quote, { constraints: true, onDelete: 'CASCADE' });

User.hasMany(OpenPosition);
OpenPosition.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
Quote.hasMany(OpenPosition);
OpenPosition.belongsTo(Quote, { constraints: true, onDelete: 'CASCADE' });

User.hasMany(ClosedPosition);
ClosedPosition.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
Quote.hasMany(ClosedPosition);
ClosedPosition.belongsTo(Quote, { constraints: true, onDelete: 'CASCADE' });

sequelize
  //.sync({ force: true })
  .sync()
  .then((result) => {
    return User.findByPk(1);
    // console.log(result);
  })
  .then((user) => {
    if (!user) {
      return bcrypt.hash('admin123!@', 12).then((hashedPw) => {
        return User.create({
          email: 'admin@admin.pl',
          password: hashedPw,
          name: 'admin',
        })
          .then((user) => {
            // console.log(user);
            return user.createWallet();
          })
          .then((wallet) => {
            symbols.forEach((symbol) => {
              Company.create({ symbol: symbol }).then((company) => {
                finnhubClient.quote(symbol, (error, data, response) => {
                  company.createQuote({
                    current: data.c,
                    change: data.d,
                    percent_change: data.dp,
                    high: data.h,
                    low: data.l,
                    open: data.o,
                    prev_close: data.pc,
                  });
                });
              });
            });
          });
      });
    }
    // Schedule tasks to be run on the server.
    cron.schedule('* * * * *', () => {
      symbols.forEach((symbol) => {
        Company.findOne({ where: { symbol: symbol } }).then((company) => {
          finnhubClient.quote(symbol, (error, data, response) => {
            Quote.update(
              {
                current: data.c,
                change: data.d,
                percent_change: data.dp,
                high: data.h,
                low: data.l,
                open: data.o,
                prev_close: data.pc,
              },
              { where: { companyId: company.id } }
            );
          });
        });
      });
    });

    cron.schedule('0,10,20,30,40,50 * * * * *', () => {
      Order.findAll({ include: Quote })
        .then((orders) => {
          if (!orders) {
            const error = new Error('Orders could not be found.');
            error.statusCode = 404;
            throw error;
          }
          orders.forEach((order) => {
            if (order.type === 'buy' && order.rate <= order.quote.current) {
              OpenPosition.create({
                type: order.type,
                value: order.value,
                profit: 0,
                change: 0,
                quoteId: order.quote.id,
                userId: user.id,
              }).then((result) => {
                order.destroy();
              });
            }
            if (order.type === 'sell' && order.rate >= order.quote.current) {
              ClosedPosition.create({
                type: order.type,
                value: order.value,
                profit: 0,
                change: 0,
                quoteId: order.quote.id,
                userId: user.id,
              });
              OpenPosition.findOne({ where: { quoteId: order.quote.id } })
                .then((order) => {
                  console.log(order);
                  if (!order) {
                    const error = new Error('Order could not be found.');
                    error.statusCode = 404;
                    throw error;
                  }
                  order.destroy();
                })
                .then((result) => {
                  order.destroy();
                });
            }
          });
        })
        .catch((err) => console.log(err));
    });

    return user;
  })
  .then((result) => {
    app.listen(5000, () => {
      console.log('Server is running on port 5000');
    });
  })
  .catch((err) => console.log(err));
