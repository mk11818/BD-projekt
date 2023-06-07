const paypal = require('@paypal/checkout-server-sdk');

const User = require('../models/user');
const OpenPosition = require('../models/open-position');
const Quote = require('../models/quote');

const Environment = paypal.core.SandboxEnvironment;
const paypalClient = new paypal.core.PayPalHttpClient(
  new Environment(
    'ATqd7kD-q7fFziV37-qm_dz47xKs1n4uO7rwog55b4jziuCKTsbg5gtpUxvXYBXxG-ri2U5dCyNrPjRD',
    'EM8-5eXIlm0IYT2efh6jGEn4UCSloaTpkyczsTeQ1kvNf8bz32k8pZjNi1rL_5wpsDNW8lHi5duVDvXl'
  )
);

const storeItems = new Map([[1, { name: 'eMakler - wpłata środków' }]]);

exports.getWallet = (req, res, next) => {
  let accountValue = 0;
  User.findByPk(req.userId)
    .then((user) => {
      user
        .getOpen_positions({
          include: { model: Quote },
        })
        .then((positions) => {
          positions.forEach((position) => {
            accountValue =
              accountValue + position.volume * position.quote.sell * 4.17;
          });
        })
        .catch((err) => {
          if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
        });
      return user.getWallet();
    })
    .then((wallet) => {
      res.status(200).json({
        message: 'Fetched wallet successfully.',
        value: wallet.value,
        accountValue: accountValue + wallet.value,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.depositFunds = async (req, res, next) => {
  const request = new paypal.orders.OrdersCreateRequest();
  const total = req.body.items.reduce((sum, item) => {
    return sum + item.price;
  }, 0);
  request.prefer('return=representation');
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [
      {
        amount: {
          currency_code: 'PLN',
          value: total,
          breakdown: {
            item_total: {
              currency_code: 'PLN',
              value: total,
            },
          },
        },
        items: req.body.items.map((item) => {
          const storeItem = storeItems.get(item.id);
          return {
            name: storeItem.name,
            unit_amount: {
              currency_code: 'PLN',
              value: item.price,
            },
            quantity: item.quantity,
          };
        }),
      },
    ],
  });

  let order;
  try {
    order = await paypalClient.execute(request);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }

  let user;
  try {
    user = await User.findByPk(req.userId);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }

  user
    .createDeposit_history({
      payment_no: order.result.id,
      amount: order.result.purchase_units[0].amount.value,
      currency: order.result.purchase_units[0].amount.currency_code,
      date: order.result.create_time,
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

  user
    .getWallet()
    .then((wallet) => {
      wallet.value = wallet.value + +total;
      return wallet.save();
    })
    .then((result) => {
      res.status(200).json({
        message: 'Wallet successfully filled.',
        value: result.value,
        id: order.result.id,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
