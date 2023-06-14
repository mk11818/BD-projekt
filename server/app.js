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
const Role = require('./models/role');
const Wallet = require('./models/wallet');
const DepositHistory = require('./models/deposit-history');
const Company = require('./models/company');
const Quote = require('./models/quote');
const QuoteHistory = require('./models/quote-history');
const Order = require('./models/order');
const OpenPosition = require('./models/open-position');
const ClosedPosition = require('./models/closed-position');
const OrderHistory = require('./models/order-history');

const api_key = finnhub.ApiClient.instance.authentications['api_key'];
api_key.apiKey = 'chdimu1r01qk9rb2k220chdimu1r01qk9rb2k22g'; // Replace this
const finnhubClient = new finnhub.DefaultApi();

const roles = [
  { name: 'admin', permission: 'default' },
  { name: 'user', permission: 'default' },
];

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

Role.hasMany(User, {
  foreignKey: {
    allowNull: false,
    defaultValue: 2,
  },
});
User.belongsTo(Role, { constraints: true, onDelete: 'CASCADE' });

User.hasOne(Wallet);
Wallet.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(DepositHistory);
DepositHistory.belongsTo(User);

Company.hasMany(Quote);
Quote.belongsTo(Company);

Quote.hasMany(QuoteHistory);
QuoteHistory.belongsTo(Quote);

User.hasMany(Order);
Order.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
Quote.hasMany(Order);
Order.belongsTo(Quote, { constraints: true, onDelete: 'CASCADE' });

User.hasMany(OrderHistory);
OrderHistory.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
Quote.hasMany(OrderHistory);
OrderHistory.belongsTo(Quote, { constraints: true, onDelete: 'CASCADE' });

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
      roles.forEach((role) => {
        Role.create({
          name: role.name,
          permission: role.permission,
        });
      });

      return bcrypt.hash('admin123!@', 12).then((hashedPw) => {
        return User.create({
          first_name: 'Jan',
          last_name: 'Kowalski',
          name: 'admin',
          email: 'admin@admin.pl',
          password: hashedPw,
          birth_date: '1999.01.01',
          phone_number: '123456789',
          roleId: '1',
        })
          .then((user) => {
            // console.log(user);
            return user.createWallet();
          })
          .then((wallet) => {
            const date = new Date();
            const toDate = Math.floor(date.getTime() / 1000);
            date.setDate(date.getDate() - 14);
            const fromDate = Math.floor(date.getTime() / 1000);

            symbols.forEach((symbol) => {
              Company.create({ symbol: symbol }).then((company) => {
                finnhubClient.quote(symbol, (error, data, response) => {
                  return company
                    .createQuote({
                      current: data.c.toFixed(2),
                      buy: (data.c * 1.005).toFixed(2),
                      sell: (data.c * 0.995).toFixed(2),
                      change: data.d.toFixed(2),
                      percent_change: data.dp.toFixed(2),
                      high: data.h.toFixed(2),
                      low: data.l.toFixed(2),
                      open: data.o.toFixed(2),
                      prev_close: data.pc.toFixed(2),
                    })
                    .then((quote) => {
                      finnhubClient.stockCandles(
                        symbol,
                        '60',
                        fromDate,
                        toDate,
                        (error, data, response) => {
                          for (let i = 0; i < data.c.length; i++) {
                            quote.createQuote_history({
                              close: data.c[i],
                              high: data.h[i],
                              low: data.l[i],
                              open: data.o[i],
                              date: new Date(data.t[i] * 1000),
                            });
                          }
                        }
                      );
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
                current: data.c.toFixed(2),
                buy: (data.c * 1.005).toFixed(2),
                sell: (data.c * 0.995).toFixed(2),
                change: data.d.toFixed(2),
                percent_change: data.dp.toFixed(2),
                high: data.h.toFixed(2),
                low: data.l.toFixed(2),
                open: data.o.toFixed(2),
                prev_close: data.pc.toFixed(2),
              },
              { where: { companyId: company.id } }
            );
          });
        });
      });
    });

    cron.schedule('* * * * * *', () => {
      Order.findAll({ include: [Quote, User] })
        .then((orders) => {
          if (!orders) {
            const error = new Error('Orders could not be found.');
            error.statusCode = 404;
            throw error;
          }
          orders.forEach((order) => {
            if (order.type === 'buy' && order.price === order.quote.buy) {
              OpenPosition.create({
                type: order.type,
                volume: order.volume,
                value: order.value,
                open_price: order.price,
                quoteId: order.quote.id,
                userId: order.user.id,
              })
                .then((result) => {
                  return User.findByPk(order.user.id);
                })
                .then((user) => {
                  return user.getWallet();
                })
                .then((wallet) => {
                  wallet.value =
                    wallet.value - +(order.value * 4.17).toFixed(2);

                  return wallet.save();
                })
                .then((result) => {
                  OrderHistory.create({
                    order_no: order.id,
                    type: order.type,
                    volume: order.volume,
                    value: order.value,
                    price: order.price,
                    quoteBuy: order.quote.buy,
                    quoteSell: order.quote.sell,
                    createdAt: order.createdAt,
                    closedAt: new Date(),
                    result: 'realised',
                    userId: order.user.id,
                    quoteId: order.quote.id,
                  });
                  order.destroy();
                });
            }

            if (order.type === 'sell' && order.price === order.quote.sell) {
              OpenPosition.findOne({
                where: { quoteId: order.quote.id },
              })
                .then((position) => {
                  if (!position) {
                    const error = new Error('Position could not be found.');
                    error.statusCode = 404;
                    throw error;
                  }

                  ClosedPosition.create({
                    type: order.type,
                    volume: order.volume,
                    value: order.value,
                    open_price: position.open_price,
                    close_price: order.quote.sell,
                    profit: (
                      position.volume * order.quote.sell * 4.17 -
                      position.value * 4.17
                    ).toFixed(2),
                    percent_profit: (
                      ((position.volume * order.quote.sell * 4.17 -
                        position.value * 4.17) /
                        (position.value * 4.17)) *
                      100
                    ).toFixed(2),
                    createdAt: position.createdAt,
                    closedAt: new Date(),
                    quoteId: order.quote.id,
                    userId: order.user.id,
                  });

                  const updatedVolume = position.volume - order.volume;
                  const updatedValue = (
                    (position.value / position.volume) *
                    updatedVolume
                  ).toFixed(2);
                  console.log(position, updatedVolume);
                  if (updatedVolume > 0) {
                    position.volume = updatedVolume;
                    position.value = updatedValue;
                    position.save();
                  } else {
                    position.destroy();
                  }
                })
                .then((result) => {
                  return User.findByPk(order.user.id);
                })
                .then((user) => {
                  return user.getWallet();
                })
                .then((wallet) => {
                  wallet.value =
                    wallet.value + +(order.value * 4.17).toFixed(2);

                  return wallet.save();
                })
                .then((result) => {
                  OrderHistory.create({
                    order_no: order.id,
                    type: order.type,
                    volume: order.volume,
                    value: order.value,
                    price: order.price,
                    quoteBuy: order.quote.buy,
                    quoteSell: order.quote.sell,
                    createdAt: order.createdAt,
                    closedAt: new Date(),
                    result: 'realised',
                    userId: order.user.id,
                    quoteId: order.quote.id,
                  });
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
