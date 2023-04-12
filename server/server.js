const express = require('express');

const app = express();

app.get('/message', (req, res) => {
  res.json({ message: 'Hello from server!' });
});

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
