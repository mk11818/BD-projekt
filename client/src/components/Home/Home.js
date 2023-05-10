import React from 'react';

import MainHeader from '../MainHeader/MainHeader';
import Card from '../UI/Card/Card';
import classes from './Home.module.css';

const Home = (props) => {
  return (
    <React.Fragment>
      <MainHeader isAuthenticated={props.isAuthenticated} onLogout={props.onLogout} />
      <Card className={classes.home}>
        <h1>Welcome back!</h1>
      </Card>
    </React.Fragment>
  );
};

export default Home;
