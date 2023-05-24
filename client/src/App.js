import React, { useEffect, useState } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';

import RootLayout from './pages/Root';
import LoginPage from './pages/Auth/Login';
import RegisterPage from './pages/Auth/Register';
import MainHeader from './components/MainHeader/MainHeader';
import Dashboard from './pages/Home/Dashboard';
import Wallet from './pages/Home/Wallet';
import Backdrop from './components/Backdrop/Backdrop';
import ErrorHandler from './components/ErrorHandler/ErrorHandler';
import PrivateRoutes from './util/PrivateRoutes';
import PublicRoutes from './util/PublicRoutes';
import ErrorPage from './pages/Error';
import OpenPositions from './pages/Home/OpenPositions';
import Orders from './pages/Home/Orders';
import ClosedPositions from './pages/Home/ClosedPositions';
import QuoteDetails from './pages/Home/QuoteDetails';

function App() {
  // const [backendData, setBackendData] = useState({});

  // useEffect(() => {
  //   fetch('/message')
  //     .then((res) => res.json())
  //     .then((data) => setBackendData(data));
  // }, []);

  //const [currentForm, setCurrentForm] = useState('login');
  const [showBackdrop, setShowBackdrop] = useState(false);

  const [isAuth, setIsAuth] = useState(false);
  const [token, setToken] = useState('');
  const [userId, setUserId] = useState('');
  const [error, setError] = useState('');

  const setAutoLogout = (milliseconds) => {
    setTimeout(() => {
      logoutHandler();
    }, milliseconds);
  };

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

  const backdropClickHandler = () => {
    setShowBackdrop(false);
    setError('');
  };

  const logoutHandler = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('expiryDate');
    localStorage.removeItem('userId');
    setIsAuth(false);
    setToken('');
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
        setToken(resData.token);
        setUserId(resData.userId);
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
        setError(err);
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
        setError(err);
      });
  };

  const errorHandler = () => {
    setError('');
  };

  // const toggleForm = (formName) => {
  //   setCurrentForm(formName);
  // };

  const router = createBrowserRouter([
    {
      path: '/',
      element: <RootLayout />,
      errorElement: <ErrorPage />,
      children: [
        {
          element: <PublicRoutes isAuth={isAuth} />,
          children: [
            {
              path: '/',
              element: <LoginPage onLogin={loginHandler} />,
            },
            {
              path: '/register',
              element: <RegisterPage onRegister={registerHandler} />,
            },
          ],
        },

        {
          element: <PrivateRoutes isAuth={isAuth} />,
          children: [
            {
              path: '/dashboard',
              element: (
                <MainHeader isAuthenticated={isAuth} onLogout={logoutHandler} />
              ),
              children: [
                {
                  path: '',
                  element: <Dashboard token={token} />,
                },
                {
                  path: '/dashboard/:quoteId',
                  element: <QuoteDetails token={token} />,
                },
                {
                  path: 'wallet',
                  element: <Wallet token={token} />,
                },
                {
                  path: 'open-positions',
                  element: <OpenPositions token={token} />,
                },
                {
                  path: 'orders',
                  element: <Orders token={token} />,
                },
                {
                  path: 'closed-positions',
                  element: <ClosedPositions token={token} />,
                },
              ],
            },
          ],
        },
      ],
    },
  ]);

  console.log('app ->', isAuth);

  return (
    <>
      {showBackdrop && <Backdrop onClick={backdropClickHandler} />}
      <ErrorHandler error={error} onHandle={errorHandler} />
      <RouterProvider router={router} />;
      {/* <h1>{!backendData.message ? 'Loading...' : backendData.message}</h1> */}
      {/*{!isAuth && currentForm === 'login' ? (
        <Login onLogin={loginHandler} onFormSwitch={toggleForm} />
      ) : (
        ''
      )}
      {!isAuth && currentForm === 'register' ? (
        <Register onFormSwitch={toggleForm} onRegister={registerHandler} />
      ) : (
        ''
      )}
      {isAuth && <Home isAuthenticated={isAuth} onLogout={logoutHandler} />} */}
      {/* {currentForm === 'login' ? (
        <Login onFormSwitch={toggleForm} onLogin={loginHandler} />
      ) : (
        <Register onFormSwitch={toggleForm} onRegister={registerHandler} />
      )} */}
    </>
  );
}

export default App;
