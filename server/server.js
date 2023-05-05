const express = require('express');

const app = express();

// app.get('/message', (req, res) => {
//   res.json({ message: 'Hello from server!' });
// });

app.get('/register', (req, res) => {
  res.json({ message: 'Pomyślna rejestracja!' });
});

app.get('/login', (req, res) => {
  res.json({ message: 'Pomyślne logowanie!' });
});

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
