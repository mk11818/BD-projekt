import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MantineReactTable } from 'mantine-react-table';

import Card from '../../components/UI/Card/Card';
import classes from './Dashboard.module.css';

const Orders = (props) => {
  const [orders, setOrders] = useState([]);

  const columns = useMemo(
    () => [
      {
        accessorKey: 'type',
        header: 'Typ',
      },
      {
        accessorKey: 'quote.company.symbol',
        header: 'Instrument',
      },
      {
        accessorKey: 'valuePLN',
        header: 'Wartość',
      },
      {
        accessorKey: 'rate',
        header: 'Kurs zlecenia',
      },
      {
        accessorKey: 'quote.current',
        header: 'Bieżący kurs',
      },
      {
        accessorKey: 'amount',
        header: 'Ilość',
      },
      {
        accessorKey: 'createdAt',
        header: 'Utworzono',
      },
      {
        accessorKey: 'btn',
        header: '',
      },
    ],
    []
  );

  const fetchingOrders = () => {
    fetch('http://localhost:5000/orders', {
      headers: {
        Authorization: 'Bearer ' + props.token,
      },
    })
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
          order.valuePLN = `${order.value} (${(order.value * 4.17).toFixed(
            2
          )} zł)`;
          order.quote.current = order.quote.current.toFixed(2);
          order.btn = (
            <button
              onClick={() => {
                deleteOrderHandler(order);
              }}
            >
              Anuluj
            </button>
          );
        });
        setOrders(resData.orders);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    fetchingOrders();
    const interval = setInterval(() => {
      fetchingOrders();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

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
      <MantineReactTable
        className={['market-table']}
        columns={columns}
        data={orders}
        enableColumnActions={false}
        enableColumnFilters={false}
        enablePagination={true}
        enableSorting={true}
        enableBottomToolbar={true}
        enableTopToolbar={false}
        mantineTableProps={{
          highlightOnHover: false,
          withColumnBorders: true,
        }}
      />
    </Card>
  );
};

export default Orders;
