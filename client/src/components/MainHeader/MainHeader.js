import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

import Navigation from './Navigation';
import classes from './MainHeader.module.css';

const MainHeader = (props) => {
  const navigate = useNavigate();

  const logoutHandler = () => {
    props.onLogout();
    navigate('/');
  };

  return (
    <>
      <header className={classes['main-header']}>
        <h1>eMakler</h1>
        <Navigation
          isLoggedIn={props.isAuthenticated}
          onLogout={logoutHandler}
        />
      </header>
      <Outlet />
    </>
  );
};

export default MainHeader;
