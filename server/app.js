const express = require('express');
const bodyParser = require('body-parser');

const loginRoutes = require('./routes/login');

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

app.use(loginRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
