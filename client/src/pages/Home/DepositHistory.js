import React, { useEffect, useMemo, useState } from 'react';

import TablePagination from '../../components/Table/TablePagination';
import Backdrop from '../../components/Backdrop/Backdrop';
import Modal from '../../components/Modal/Modal';
import Card from '../../components/UI/Card/Card';
import classes from './Dashboard.module.css';

const DepositHistory = (props) => {
  const [deposit, setDesposit] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRow, setTotalRow] = useState(0);
  const [pageCount, setPageCount] = useState(0);

  const columns = useMemo(
    () => [
      {
        Header: 'Numer płatności',
        accessor: 'payment_no',
      },
      {
        Header: 'Kwota',
        accessor: 'value',
      },
      {
        Header: 'Waluta',
        accessor: 'currency',
      },
      {
        Header: 'Data płatnosci',
        accessor: 'date',
      },
    ],
    []
  );

  const fetchingDeposit = (pageIndex, pageSize, search, sortBy) => {
    setLoading(true);
    if (!sortBy) {
      sortBy = { id: '', desc: '' };
    }
    fetch(
      'http://localhost:5000/deposit-history/?page=' +
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
        resData.depositHistory.map((deposit) => {
          deposit.date = props.formatDate(new Date(deposit.date));
        });
        setDesposit(resData.depositHistory);
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
        data={deposit}
        title='Historia wpłat'
        fetchData={fetchingDeposit}
        loading={loading}
        pageCount={pageCount}
        totalRow={totalRow}
      />
    </Card>
  );
};

export default DepositHistory;
