import React, { useEffect, useMemo, useState } from 'react';

import TablePagination from '../../components/Table/TablePagination';
import Card from '../../components/UI/Card/Card';
import classes from './Dashboard.module.css';
import { useParams } from 'react-router-dom';

const QuoteHistory = (props) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRow, setTotalRow] = useState(0);
  const [pageCount, setPageCount] = useState(0);

  const columns = useMemo(
    () => [
      {
        Header: 'Instrument',
        accessor: 'quote.company.symbol',
        disableSortBy: true,
      },
      {
        Header: 'Cena zamknięcia',
        accessor: 'close',
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
        Header: 'Data',
        accessor: 'date',
      },
    ],
    []
  );

  const { quoteId } = useParams();

  const fetchingData = (pageIndex, pageSize, search, sortBy) => {
    setLoading(true);
    if (!sortBy) {
      sortBy = { id: '', desc: '' };
    }
    fetch(
      'http://localhost:5000/quote-history/' +
        quoteId +
        '/?page=' +
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
        resData.quoteHistory.map((quote) => {
          quote.quote.company.symbol = quote.quote.company.symbol;
          quote.close = quote.close.toFixed(2);
          quote.high = quote.high.toFixed(2);
          quote.low = quote.low.toFixed(2);
          quote.open = quote.open.toFixed(2);
          quote.date = props.formatDate(new Date(quote.date));
          return quote;
        });
        console.log(resData);
        setData(resData.quoteHistory);
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
        data={data}
        title='Historia notowań'
        fetchData={fetchingData}
        loading={loading}
        pageCount={pageCount}
        totalRow={totalRow}
      />
    </Card>
  );
};

export default QuoteHistory;
