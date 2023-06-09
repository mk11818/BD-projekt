import React, { useEffect, useMemo, useState } from 'react';

import TablePagination from '../../components/Table/TablePagination';
import Backdrop from '../../components/Backdrop/Backdrop';
import Modal from '../../components/Modal/Modal';
import Card from '../../components/UI/Card/Card';
import classes from './Dashboard.module.css';

const OrdersHistory = (props) => {
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
        Header: 'Numer',
        accessor: 'id',
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
        Header: 'Cena zakupu / sprzedaży',
        accessor: 'quotePrice',
        disableSortBy: true,
      },
      {
        Header: 'Utworzono',
        accessor: 'createdAt',
      },
      {
        Header: 'Zakończono',
        accessor: 'closedAt',
      },
      {
        Header: 'Rezultat',
        accessor: 'result',
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
      'http://localhost:5000/orders-history/?page=' +
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
        resData.orders.map((order) => {
          const fetchedOrder = { ...order };
          if (order.type === 'buy') {
            order.type = 'Kup';
            order.quotePrice = order.quote.buy.toFixed(2);
          } else {
            order.type = 'Sprzedaj';
            order.quotePrice = order.quote.sell.toFixed(2);
          }
          order.value = `${order.value.toFixed(2)} (${(
            order.value * 4.17
          ).toFixed(2)} zł)`;
          order.price = order.price.toFixed(2);
          order.createdAt = props.formatDate(new Date(order.createdAt));
          order.closedAt = props.formatDate(new Date(order.closedAt));
          if (order.result === 'realised') {
            order.result = 'Zrealizowane';
          } else {
            order.result = 'Anulowane';
          }
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

  return (
    <Card className={classes.home}>
      <TablePagination
        columns={columns}
        data={orders}
        title='Historia zleceń'
        fetchData={fetchingOrders}
        loading={loading}
        pageCount={pageCount}
        totalRow={totalRow}
      />
    </Card>
  );
};

export default OrdersHistory;
