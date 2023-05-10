import React, { useEffect, useState } from 'react';

import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home/Home';

function App() {
  // const [backendData, setBackendData] = useState({});

  // useEffect(() => {
  //   fetch('/message')
  //     .then((res) => res.json())
  //     .then((data) => setBackendData(data));
  // }, []);

  const [currentForm, setCurrentForm] = useState('login');
  const [isAuth, setIsAuth] = useState(false);
  const [token, setToken] = useState('');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const expiryDate = localStorage.getItem('expiryDate');
    if (!token || !expiryDate) {
      return;
    }
    if (new Date(expiryDate) <= new Date()) {
      logoutHandler();
      return;
    }
    const userId = localStorage.getItem('userId');
    const remainingMilliseconds =
      new Date(expiryDate).getTime() - new Date().getTime();
    setIsAuth(true);
    setToken(token);
    setUserId(userId);
    setAutoLogout(remainingMilliseconds);
  }, []);

  const logoutHandler = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('expiryDate');
    localStorage.removeItem('userId');
    setIsAuth(false);
  };

  const loginHandler = (email, pwd) => {
    fetch('http://localhost:5000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: pwd,
      }),
    })
      .then((res) => {
        if (res.status === 422) {
          throw new Error('Validation failed.');
        }
        if (res.status !== 200 && res.status !== 201) {
          console.log('Error!');
          throw new Error('Could not authenticate you!');
        }
        return res.json();
      })
      .then((resData) => {
        console.log(resData);
        setIsAuth(true);
        setToken(token);
        setUserId(userId);
        localStorage.setItem('token', resData.token);
        localStorage.setItem('userId', resData.userId);
        const remainingMilliseconds = 60 * 60 * 1000;
        const expiryDate = new Date(
          new Date().getTime() + remainingMilliseconds
        );
        localStorage.setItem('expiryDate', expiryDate.toISOString());
        setAutoLogout(remainingMilliseconds);
      })
      .catch((err) => {
        console.log(err);
        setIsAuth(false);
      });
  };

  const registerHandler = (user, email, pwd) => {
    fetch('http://localhost:5000/auth/register', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: user,
        email: email,
        password: pwd,
      }),
    })
      .then((res) => {
        if (res.status === 422) {
          throw new Error(
            "Validation failed. Make sure the email address isn't used yet!"
          );
        }
        if (res.status !== 200 && res.status !== 201) {
          console.log('Error!');
          throw new Error('Creating a user failed!');
        }
        return res.json();
      })
      .then((resData) => {
        console.log(resData);
        setIsAuth(false);
      })
      .catch((err) => {
        console.log(err);
        setIsAuth(false);
      });
  };

  const setAutoLogout = (milliseconds) => {
    setTimeout(() => {
      logoutHandler();
    }, milliseconds);
  };

  const toggleForm = (formName) => {
    setCurrentForm(formName);
  };

  return (
    <div className='App'>
      {/* <h1>{!backendData.message ? 'Loading...' : backendData.message}</h1> */}

      {!isAuth && currentForm === 'login' ? (
        <Login onLogin={loginHandler} onFormSwitch={toggleForm} />
      ) : (
        ''
      )}
      {!isAuth && currentForm === 'register' ? (
        <Register onFormSwitch={toggleForm} onRegister={registerHandler} />
      ) : (
        ''
      )}
      {isAuth && <Home isAuthenticated={isAuth} onLogout={logoutHandler} />}
      {/* {currentForm === 'login' ? (
        <Login onFormSwitch={toggleForm} onLogin={loginHandler} />
      ) : (
        <Register onFormSwitch={toggleForm} onRegister={registerHandler} />
      )} */}
    </div>
  );
}

export default App;
