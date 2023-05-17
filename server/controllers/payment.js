const paypal = require('@paypal/checkout-server-sdk');

const Environment = paypal.core.SandboxEnvironment;
const paypalClient = new paypal.core.PayPalHttpClient(
  new Environment(
    'ATqd7kD-q7fFziV37-qm_dz47xKs1n4uO7rwog55b4jziuCKTsbg5gtpUxvXYBXxG-ri2U5dCyNrPjRD',
    'EAeU8kRcQK1E7arwg6d_xvhVBeAampQjz6sg8xNbO3sICtOOcUySGvwF92nN6LIpq7sEJh-9EPF5x_mW'
  )
);

const storeItems = new Map([[1, { name: 'eMakler - wpłata środków' }]]);

exports.fillWallet = async (req, res) => {
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

  try {
    const order = await paypalClient.execute(request);
    res.json({ id: order.result.id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
