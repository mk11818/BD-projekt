import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

import Card from '../../components/UI/Card/Card';
import classes from './Wallet.module.css';
import MarketBuyFrom from '../../components/Form/MarketBuyForm';

const QuoteDetails = (props) => {
  const [quote, setQuote] = useState();
  const [wallet, setWallet] = useState();
  const [success, setSuccess] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [isOrder, setIsOrder] = useState(false);

  const { quoteId } = useParams();

  const fetchingQuote = () => {
    fetch('http://localhost:5000/quote/' + quoteId, {
      headers: {
        Authorization: 'Bearer ' + props.token,
      },
    })
      .then((res) => {
        if (res.status !== 200) {
          throw new Error('Failed to fetch quote');
        }
        return res.json();
      })
      .then((resData) => {
        const fetchedQuote = { ...resData.quote };
        const parsedQuote = {
          id: fetchedQuote.id,
          current: fetchedQuote.current.toFixed(2),
          buy: fetchedQuote.buy.toFixed(2),
          sell: fetchedQuote.sell.toFixed(2),
          change: fetchedQuote.change.toFixed(2),
          percent_change: fetchedQuote.percent_change.toFixed(2),
          high: fetchedQuote.high.toFixed(2),
          low: fetchedQuote.low.toFixed(2),
          open: fetchedQuote.open.toFixed(2),
          prev_close: fetchedQuote.prev_close.toFixed(2),
          company: fetchedQuote.company,
        };
        console.log(resData);
        setQuote(parsedQuote);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const fetchingWallet = () => {
    fetch('http://localhost:5000/wallet', {
      headers: {
        Authorization: 'Bearer ' + props.token,
      },
    })
      .then((res) => {
        if (res.status !== 200) {
          throw new Error('Failed to fetch wallet');
        }
        return res.json();
      })
      .then((resData) => {
        setWallet(resData);
        console.log(resData);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    fetchingQuote();
    fetchingWallet();
    const interval = setInterval(() => {
      fetchingQuote();
      fetchingWallet();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // useEffect - loading data
  if (!quote || !wallet) {
    return;
  }

  return (
    <Card className={classes.home}>
      <h1>Informacje</h1>
      <h3>{quote.company.symbol}</h3>
      <hr />
      <div>
        <p>
          <span className={classes['quote-info__title']}> Cena rynkowa: </span>
          {quote.current}
        </p>
        <p>
          <span className={classes['quote-info__title']}> Zmiana: </span>
          {quote.change} ({quote.percent_change}%)
        </p>
        <p>
          <span className={classes['quote-info__title']}>
            Najwyższa cena w dniu:
          </span>{' '}
          {quote.high}
        </p>
        <p>
          <span className={classes['quote-info__title']}>
            Najniższa cena w dniu:
          </span>{' '}
          {quote.low}
        </p>
        <p>
          <span className={classes['quote-info__title']}>Cena otwarcia:</span>{' '}
          {quote.open}
        </p>
        <p>
          <span className={classes['quote-info__title']}>
            Poprzednia cena zamknięcia:
          </span>{' '}
          {quote.prev_close}
        </p>
        <hr />
        <p>
          <span className={classes['quote-info__title']}>
            Obecna cena zakupu:
          </span>{' '}
          {quote.buy}
        </p>
        <p>
          <span className={classes['quote-info__title']}>
            Obecna cena sprzedaży:
          </span>{' '}
          {quote.sell}
        </p>
      </div>

      <Link to={'/dashboard/quote-history/' + quoteId}>
        <button className={classes['btn-blue']}>Historia notowań</button>
      </Link>

      <button
        onClick={() => {
          setIsBuying(true);
          setIsOrder(false);
          setSuccess(false);
        }}
        className={classes['btn-blue']}
      >
        Zakup natychmiastowy
      </button>
      <button
        onClick={() => {
          setIsBuying(true);
          setIsOrder(true);
          setSuccess(false);
        }}
        className={classes['btn-blue']}
      >
        Zlecenie oczekujące
      </button>

      {isBuying && (
        <>
          <hr />
          {!isOrder && (
            <MarketBuyFrom
              token={props.token}
              type='buy'
              title='Zakup natychmiastowy'
              quote={quote}
              wallet={wallet}
              isOrder={isOrder}
              onSuccess={setSuccess}
              onFinishOrder={setIsBuying}
            />
          )}
          {isOrder && (
            <MarketBuyFrom
              token={props.token}
              type='buy'
              title='Zlecenie oczekujące'
              quote={quote}
              wallet={wallet}
              isOrder={isOrder}
              onSuccess={setSuccess}
              onFinishOrder={setIsBuying}
            />
          )}
        </>
      )}
      {success && (
        <h2>
          {!isOrder
            ? 'Pomyślnie dokonano zakupu!'
            : 'Pomyślnie utworzono zlecenie!'}
        </h2>
      )}
    </Card>
  );
};

export default QuoteDetails;
