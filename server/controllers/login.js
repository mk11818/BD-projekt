exports.register = (req, res, next) => {
  res.status(200).json({ message: 'Pomyślna rejestracja!' });
};

exports.login = (req, res, next) => {
  res.status(200).json({ message: 'Pomyślne logowanie!' });
};
