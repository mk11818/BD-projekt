import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import Card from '../../components/UI/Card/Card';
import classes from './Dashboard.module.css';
import TablePagination from '../../components/Table/TablePagination';

const ClosedPositions = (props) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRow, setTotalRow] = useState(0);
  const [pageCount, setPageCount] = useState(0);

  const columns = useMemo(
    () => [
      {
        Header: 'Typ',
        accessor: 'type',
      },
      {
        Header: 'Instrument',
        accessor: 'quote.company.symbol',
        disableSortBy: true,
      },
      {
        Header: 'Wolumen',
        accessor: 'volume',
      },
      {
        Header: 'Wartość',
        accessor: 'value',
      },
      {
        Header: 'Cena otwarcia',
        accessor: 'open_price',
      },
      {
        Header: 'Cena sprzedaży',
        accessor: 'close_price',
        disableSortBy: true,
      },
      {
        Header: 'Zysk / strata',
        accessor: 'profit',
        disableSortBy: true,
      },
      {
        Header: 'Data zakupu',
        accessor: 'createdAt',
      },
      {
        Header: 'Data sprzedaży',
        accessor: 'closedAt',
      },
    ],
    []
  );

  const fetchingOrders = (pageIndex, pageSize, search, sortBy) => {
    setLoading(true);
    if (!sortBy) {
      sortBy = { id: '', desc: '' };
    }
    fetch(
      'http://localhost:5000/closed-positions/?page=' +
        pageIndex +
        '&limit=' +
        pageSize +
        '&search=' +
        search +
        '&sortBy=' +
        sortBy.id +
        '&desc=' +
        sortBy.desc,
      {
        headers: {
          Authorization: 'Bearer ' + props.token,
        },
      }
    )
      .then((res) => {
        if (res.status !== 200) {
          throw new Error('Failed to fetch open positions');
        }
        return res.json();
      })
      .then((resData) => {
        console.log(resData);
        resData.positions.map((position) => {
          position.type = 'Sprzedaj';
          position.value = `${position.value.toFixed(2)} (${(
            position.value * 4.17
          ).toFixed(2)} zł)`;
          position.open_price = position.open_price.toFixed(2);
          position.close_price = position.close_price.toFixed(2);
          position.profit = (
            <span
              className={classes[`${position.profit >= 0 ? 'green' : 'red'}`]}
            >
              {position.profit} zł ({position.percent_profit}%)
            </span>
          );
          position.createdAt = props.formatDate(new Date(position.createdAt));
          position.closedAt = props.formatDate(new Date(position.closedAt));
        });
        console.log(resData.positions);
        setOrders(resData.positions);
        setTotalRow(resData.totalRow);
        setPageCount(Math.ceil(resData.totalRow / pageSize));
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <Card className={classes.home}>
      <TablePagination
        columns={columns}
        data={orders}
        title='Zamknięte pozycje'
        fetchData={fetchingOrders}
        loading={loading}
        pageCount={pageCount}
        totalRow={totalRow}
      />
    </Card>
  );
};

export default ClosedPositions;
