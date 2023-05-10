import React from 'react';

import classes from './Navigation.module.css';

const Navigation = (props) => {
  return (
    <nav className={classes.nav}>
      <ul>
        {props.isLoggedIn && (
          <li>
            <a href="/">Transkacje</a>
          </li>
        )}
        {props.isLoggedIn && (
          <li>
            <a href="/">Portfel</a>
          </li>
        )}
        {props.isLoggedIn && (
          <li>
            <button onClick={props.onLogout}>Wyloguj</button>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navigation;
