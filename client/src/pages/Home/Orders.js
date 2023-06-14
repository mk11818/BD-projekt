import React, { useEffect, useMemo, useState } from 'react';
import { FaArrowRight } from 'react-icons/fa';

import TablePagination from '../../components/Table/TablePagination';
import Backdrop from '../../components/Backdrop/Backdrop';
import Modal from '../../components/Modal/Modal';
import Card from '../../components/UI/Card/Card';
import classes from './Dashboard.module.css';
import { Link } from 'react-router-dom';

const Orders = (props) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRow, setTotalRow] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelOrder, setCancelOrder] = useState({});

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
          order.btn = (
            <button
              onClick={() => {
                setCancelOrder(fetchedOrder);
                setIsCancelling(true);
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
        setCancelOrder({});
        setIsCancelling(false);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <>
      {isCancelling && (
        <>
          <Backdrop />
          <Modal
            title={`Zlecenie nr ${cancelOrder.id}`}
            acceptEnabled={true}
            onCancelModal={() => setIsCancelling(false)}
            onAcceptModal={() => deleteOrderHandler(cancelOrder)}
          >
            <p>Czy napewno chcesz anulować podane zlecenie?</p>
          </Modal>
        </>
      )}
      <Card className={classes.home}>
        <div className={classes['btn-link']}>
          <Link to='/dashboard/orders-history'>
            <button className={classes['btn-blue']}>Historia zleceń <FaArrowRight /></button>
          </Link>
        </div>
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
    </>
  );
};

export default Orders;
