import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import TablePagination from '../../components/Table/TablePagination';
import Card from '../../components/UI/Card/Card';
import classes from './Dashboard.module.css';

const Orders = (props) => {
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
        Header: 'Ilość',
        accessor: 'volume',
      },
      {
        Header: 'Wartość',
        accessor: 'value',
      },
      {
        Header: 'Cena zlecenia',
        accessor: 'price',
      },
      {
        Header: 'Cena rynkowa',
        accessor: 'quote.current',
        disableSortBy: true,
      },
      {
        Header: 'Utworzono',
        accessor: 'createdAt',
      },
      {
        Header: '',
        accessor: 'btn',
        disableSortBy: true,
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
      'http://localhost:5000/orders/?page=' +
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
          throw new Error('Failed to fetch orders');
        }
        return res.json();
      })
      .then((resData) => {
        console.log(resData);
        resData.orders.map((order) => {
          if (order.type === 'buy') {
            order.type = 'Kup';
          } else {
            order.type = 'Sprzedaj';
          }
          order.value = `${order.value} (${(order.value * 4.17).toFixed(
            2
          )} zł)`;
          order.quote.current = order.quote.current.toFixed(2);
          order.createdAt = props.formatDate(new Date(order.createdAt));
          order.btn = (
            <button
              onClick={() => {
                deleteOrderHandler(order);
              }}
              className={classes['btn-red']}
            >
              Anuluj
            </button>
          );
        });
        setOrders(resData.orders);
        setTotalRow(resData.totalRow);
        setPageCount(Math.ceil(resData.totalRow / pageSize));
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const deleteOrderHandler = (order) => {
    fetch('http://localhost:5000/delete-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + props.token,
      },
      body: JSON.stringify({
        order: order,
      }),
    })
      .then((res) => {
        if (res.status !== 200 && res.status !== 201) {
          console.log('Error!');
          throw new Error('Could not delete an order!');
        }
        return res.json();
      })
      .then((resData) => {
        console.log(resData);
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
        title='Zlecenia'
        fetchData={fetchingOrders}
        loading={loading}
        pageCount={pageCount}
        totalRow={totalRow}
      />
    </Card>
  );
};

export default Orders;
