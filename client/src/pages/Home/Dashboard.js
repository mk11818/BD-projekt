import React, { useEffect, useState } from 'react';

import Card from '../../components/UI/Card/Card';
import classes from './Dashboard.module.css';

const Dashboard = (props) => {
  const [data, setData] = useState({});

  useEffect(() => {
    fetch('http://localhost:5000/quotes', {
      headers: {
        Authorization: 'Bearer ' + props.token,
      },
    })
      .then((res) => {
        if (res.status !== 200) {
          throw new Error('Failed to fetch quotes');
        }
        return res.json();
      })
      .then((resData) => {
        setData(resData);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [props.token]);

  return (
    <Card className={classes.home}>
      <h1>Welcome back!</h1>
      Apple <br /> <br /> Obecna cena: {data.c} <br /> Zmiana: {data.d} (
      {data.dp}%) <br /> Cena otwarcia: {data.o} <br /> Cena zamknięcia:{' '}
      {data.pc}
    </Card>
  );
};

export default Dashboard;
