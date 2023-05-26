import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MantineReactTable } from 'mantine-react-table';

import Card from '../../components/UI/Card/Card';
import classes from './Dashboard.module.css';

const OpenPositions = (props) => {
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
        accessorKey: 'profit',
        header: 'Zysk / strata',
      },
      {
        accessorKey: 'change',
        header: 'Zmiana',
      },
      {
        accessorKey: 'createdAt',
        header: 'Data zakupu',
      },
      {
        accessorKey: 'btn',
        header: '',
      },
    ],
    []
  );

  const fetchingOrders = () => {
    fetch('http://localhost:5000/open-positions', {
      headers: {
        Authorization: 'Bearer ' + props.token,
      },
    })
      .then((res) => {
        if (res.status !== 200) {
          throw new Error('Failed to fetch open positions');
        }
        return res.json();
      })
      .then((resData) => {
        console.log(resData);
        resData.positions.map((position) => {
          position.type = 'Kup';
          position.valuePLN = `${position.value} (${(
            position.value * 4.17
          ).toFixed(2)} zł)`;
          position.btn = (
            <Link to={'/dashboard/' + position.quote.id}>
              <button>Sprzedaj</button>
            </Link>
          );
        });
        setOrders(resData.positions);
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

export default OpenPositions;
