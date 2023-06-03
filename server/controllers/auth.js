const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.register = (req, res, next) => {
  const userData = req.body.userData;
  console.log(userData);
  bcrypt
    .hash(userData.password, 12)
    .then((hashedPw) => {
      return User.create({
        first_name: userData.firstName,
        last_name: userData.lastName,
        name: userData.name,
        email: userData.email,
        password: hashedPw,
        birth_date: userData.birthDate,
        phone_number: userData.phoneNumber,
      });
    })
    .then((result) => {
      result.createWallet();
      res
        .status(201)
        .json({ message: 'Pomyślna rejestracja!', userId: result.id });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;
  User.findOne({ where: { email: email } })
    .then((user) => {
      if (!user) {
        const error = new Error('A user with this email could not be found.');
        error.statusCode = 401;
        throw error;
      }
      loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then((isEqual) => {
      if (!isEqual) {
        const error = new Error('Wrong password!');
        error.statusCode = 401;
        throw error;
      }
      const token = jwt.sign(
        {
          email: loadedUser.email,
          userId: loadedUser.id.toString(),
        },
        'test',
        { expiresIn: '1h' }
      );
      res.status(200).json({
        message: 'Pomyślne logowanie!',
        token: token,
        userId: loadedUser.id.toString(),
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
