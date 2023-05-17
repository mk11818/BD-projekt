import React from 'react';
import { NavLink } from 'react-router-dom';

import classes from './Navigation.module.css';

const Navigation = (props) => {
  return (
    <nav className={classes.nav}>
      <ul>
        {props.isLoggedIn && (
          <li>
            <NavLink to='/dashboard'>Transkacje</NavLink>
          </li>
        )}
        {props.isLoggedIn && (
          <li>
            <NavLink to='/dashboard/wallet'>Portfel</NavLink>
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
