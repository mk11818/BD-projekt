import React, { useEffect, useState } from 'react';
import {
  useAsyncDebounce,
  useGlobalFilter,
  usePagination,
  useSortBy,
  useTable,
} from 'react-table';

import {
  FaArrowUp,
  FaArrowDown,
  FaFilter,
  FaClock,
  FaAngleLeft,
  FaAngleRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
} from 'react-icons/fa';

import classes from './TablePagination.module.css';

function TablePagination({
  columns,
  data,
  title,
  fetchData,
  loading,
  pageCount: controlledPageCount,
  totalRow,
  actions: Actions,
}) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize, globalFilter, sortBy },
    preGlobalFilteredRows,
    setGlobalFilter,
  } = useTable(
    {
      columns,
      data,
      manualPagination: true,
      manualGlobalFilter: true,
      manualSortBy: true,
      initialState: {
        pageIndex: 0,
        pageSize: 5,
      }, // Pass our hoisted table state
      pageCount: controlledPageCount,
      autoResetSortBy: false,
      autoResetExpanded: false,
      autoResetPage: false,
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  const GlobalFilter = ({
    preGlobalFilteredRows,
    globalFilter,
    setGlobalFilter,
  }) => {
    const count = preGlobalFilteredRows;
    const [value, setValue] = useState(globalFilter);
    const onChange = useAsyncDebounce((value) => {
      setGlobalFilter(value || undefined);
      gotoPage(0);
    }, 700);

    return (
      <div className={classes['mantine-toolbar__search']}>
        {Actions !== undefined ? <Actions /> : null}
        <input
          value={value || ''}
          onChange={(e) => {
            setValue(e.target.value);
            onChange(e.target.value);
          }}
          placeholder='Wyszukaj'
          type='search'
          className={`${Actions !== undefined ? '' : 'self-end'}`}
        />
      </div>
    );
  };

  useEffect(() => {
    let search = globalFilter === undefined ? '' : globalFilter;
    fetchData(pageIndex, pageSize, search, sortBy[0]);
    const interval = setInterval(() => {
      fetchData(pageIndex, pageSize, search, sortBy[0]);
    }, 10000);
    return () => clearInterval(interval);
  }, [pageIndex, pageSize, globalFilter, sortBy]);

  return (
    <div className={classes.mantine}>
      <div className={classes['mantine-toolbar-top']}>
        <h2>{title}</h2>
        <div className={classes['mantine-toolbar-top-tools']}>
          <GlobalFilter
            preGlobalFilteredRows={totalRow}
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
          />
        </div>
      </div>
      <div className={classes['mantine-table']}>
        <table {...getTableProps()}>
          <thead className={classes['mantine-thead']}>
            {headerGroups.map((headerGroup) => (
              <tr
                {...headerGroup.getHeaderGroupProps()}
                className={classes['mantine-thead-tr']}
              >
                {headerGroup.headers.map((column) => (
                  <th
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    className={classes['mantine-thead-th']}
                  >
                    <span>
                      {column.isSorted ? (
                        column.isSortedDesc ? (
                          <FaArrowDown />
                        ) : (
                          <FaArrowUp />
                        )
                      ) : (
                        <FaFilter />
                      )}
                    </span>
                    {column.render('Header')}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()} className={classes['mantine-tbody']}>
            {page.length > 0 ? (
              page.map((row, i) => {
                prepareRow(row);
                return (
                  <tr
                    {...row.getRowProps()}
                    className={classes['mantine-tbody-tr']}
                  >
                    {row.cells.map((cell) => {
                      return (
                        <td
                          {...cell.getCellProps()}
                          className={classes['mantine-tbody-td']}
                        >
                          {cell.render('Cell')}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={10000}>
                  {loading ? (
                    <div className={classes['mantine-loading']}>
                      <FaClock /> <span>Ładowanie...</span>
                    </div>
                  ) : (
                    <span>Brak danych do wyświetlenia!</span>
                  )}
                </td>
              </tr>
            )}
          </tbody>
          <tfoot className={classes['mantine-tfoot']}></tfoot>
        </table>
      </div>
      <div className={classes['mantine-toolbar-bottom']}>
        <div className={classes['mantine-toolbar-bottom-tools']}>
          <div className={classes['mantine-toolbar__pages']}>
            <label htmlFor='page_count'>Pokaż</label>
            {/* <span>
              | Liczba rekordów:{' '}
              <input
                type='number'
                defaultValue={pageIndex + 1}
                onChange={(e) => {
                  const page = e.target.value ? Number(e.target.value) - 1 : 0;
                  gotoPage(page);
                }}
                className='input input-bordered input-sm w-20 max-w-xs focus:outline-0'
              />
            </span>{' '} */}
            <select
              id='page_count'
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
              }}
            >
              {[5, 10, 15, 20, 25, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>
          <div className={classes['mantine-toolbar__text']}>
            {'Strona '}
            <strong>
              {pageIndex + 1} - {pageOptions.length}
            </strong>{' '}
            Łącznie <strong>{totalRow}</strong>{' '}
          </div>
          <div className={classes['mantine-toolbar__buttons']}>
            <button
              className={classes['mantine-toolbar__btn']}
              onClick={() => gotoPage(0)}
              disabled={!canPreviousPage}
            >
              <FaAngleDoubleLeft />
            </button>{' '}
            <button
              className={classes['mantine-toolbar__btn']}
              onClick={() => previousPage()}
              disabled={!canPreviousPage}
            >
              <FaAngleLeft />
            </button>{' '}
            <button
              className={classes['mantine-toolbar__btn']}
              onClick={() => nextPage()}
              disabled={!canNextPage}
            >
              <FaAngleRight />
            </button>{' '}
            <button
              className={classes['mantine-toolbar__btn']}
              onClick={() => gotoPage(pageCount - 1)}
              disabled={!canNextPage}
            >
              <FaAngleDoubleRight />
            </button>{' '}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TablePagination;
