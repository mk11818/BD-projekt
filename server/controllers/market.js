const finnhub = require('finnhub');

const api_key = finnhub.ApiClient.instance.authentications['api_key'];
api_key.apiKey = 'chdimu1r01qk9rb2k220chdimu1r01qk9rb2k22g'; // Replace this
const finnhubClient = new finnhub.DefaultApi();

exports.getQuotes = (req, res, next) => {
  // Quotes
  finnhubClient.quote('AAPL', (error, data, response) => {
    res.status(200).json(data);
    console.log(data);
  });
};
