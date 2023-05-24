const express = require('express');
const bodyParser = require('body-parser');
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
    return user;
  })
  .then((result) => {
    app.listen(5000, () => {
      console.log('Server is running on port 5000');
    });
  })
  .catch((err) => console.log(err));
