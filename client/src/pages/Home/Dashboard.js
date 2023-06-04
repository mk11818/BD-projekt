import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import TablePagination from '../../components/Table/TablePagination';
import Card from '../../components/UI/Card/Card';
import classes from './Dashboard.module.css';

const Dashboard = (props) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRow, setTotalRow] = useState(0);
  const [pageCount, setPageCount] = useState(0);

  const columns = useMemo(
    () => [
      {
        Header: 'Instrument',
        accessor: 'company.symbol',
        disableSortBy: true,
      },
      {
        Header: 'Zmiana',
        accessor: 'change',
      },
      {
        Header: 'Cena rynkowa',
        accessor: 'current',
      },
      {
        Header: 'Wysoki',
        accessor: 'high',
      },
      {
        Header: 'Niski',
        accessor: 'low',
      },
      {
        Header: 'Cena otwarcia',
        accessor: 'open',
      },
      {
        Header: '',
        accessor: 'btn',
        disableSortBy: true,
      },
      // {
      //   Header: 'Action',
      //   accessor: ({ row }) => {
      //     return (
      //       <div className='flex gap-2'>
      //         <button className='btn btn-xs btn-info'>
      //           XD
      //         </button>
      //         <button className='btn btn-xs btn-error'>
      //           DX
      //         </button>
      //       </div>
      //     );
      //   },
      // },
    ],
    []
  );

  const fetchingData = (pageIndex, pageSize, search, sortBy) => {
    setLoading(true);
    if (!sortBy) {
      sortBy = { id: '', desc: '' };
    }
    fetch(
      'http://localhost:5000/quotes/?page=' +
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
          throw new Error('Failed to fetch quotes');
        }
        return res.json();
      })
      .then((resData) => {
        resData.quotes.map((quote) => {
          quote.change = (
            <span className={classes[`${quote.change >= 0 ? 'green' : 'red'}`]}>
              {quote.change.toFixed(2)} ({quote.percent_change.toFixed(2)}
              %)
            </span>
          );
          quote.current = quote.current.toFixed(2);
          quote.high = quote.high.toFixed(2);
          quote.low = quote.low.toFixed(2);
          quote.open = quote.open.toFixed(2);
          quote.prev_close = quote.prev_close.toFixed(2);
          quote.btn = (
            <Link to={'/dashboard/' + quote.id}>
              <button className={classes['btn-blue']}>Szczegóły</button>
            </Link>
          );
          return quote;
        });
        console.log(resData);
        setData(resData.quotes);
        setTotalRow(resData.totalRow);
        setPageCount(Math.ceil(resData.totalRow / pageSize));
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // useEffect(() => {
  //   fetchingData();
  //   const interval = setInterval(() => {
  //     fetchingData();
  //   }, 60000);
  //   return () => clearInterval(interval);
  // }, []);

  return (
    <Card className={classes.home}>
      {/* <h1>Welcome back!</h1>
      Apple <br /> <br /> Obecna cena: {data.c} <br /> Zmiana: {data.d} (
      {data.dp}%) <br /> Cena otwarcia: {data.o} <br /> Cena zamknięcia:{' '}
      {data.pc} */}
      <TablePagination
        columns={columns}
        data={data}
        title='Market'
        fetchData={fetchingData}
        loading={loading}
        pageCount={pageCount}
        totalRow={totalRow}
      />
    </Card>
  );
};

export default Dashboard;
