import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MantineReactTable } from 'mantine-react-table';

import Card from '../../components/UI/Card/Card';
import classes from './Dashboard.module.css';

const Dashboard = (props) => {
  const [data, setData] = useState([]);

  const columns = useMemo(
    () => [
      {
        accessorKey: 'company.symbol',
        header: 'Instrument',
      },
      {
        accessorKey: 'change',
        header: 'Zmiana',
      },
      {
        accessorKey: 'current',
        header: 'Kup',
      },
      {
        accessorKey: 'high',
        header: 'Wysoki',
      },
      {
        accessorKey: 'low',
        header: 'Niski',
      },
      {
        accessorKey: 'btn',
        header: '',
      },
    ],
    []
  );

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
        resData.quotes.map((quote) => {
          quote.change = `${quote.change} (${quote.percent_change.toFixed(
            2
          )}%)`;
          quote.btn = (
            <Link to={'/dashboard/' + quote.id}>
              <button>Kup</button>
            </Link>
          );
          return quote;
        });
        console.log(resData.message);
        setData(resData.quotes);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [props.token]);

  return (
    <Card className={classes.home}>
      {/* <h1>Welcome back!</h1>
      Apple <br /> <br /> Obecna cena: {data.c} <br /> Zmiana: {data.d} (
      {data.dp}%) <br /> Cena otwarcia: {data.o} <br /> Cena zamknięcia:{' '}
      {data.pc} */}
      <MantineReactTable
        className={['market-table']}
        columns={columns}
        data={data}
        enableColumnActions={false}
        enableColumnFilters={false}
        enablePagination={true}
        enableSorting={false}
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

export default Dashboard;
