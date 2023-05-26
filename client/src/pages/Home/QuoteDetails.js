import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

import Card from '../../components/UI/Card/Card';
import classes from './Wallet.module.css';

const QuoteDetails = (props) => {
  const [quote, setQuote] = useState();
  const [wallet, setWallet] = useState();
  const [amount, setAmount] = useState('');
  const [valueDolar, setValueDolar] = useState(0);
  const [valuePLN, setValuePLN] = useState(0);
  const [rate, setRate] = useState(0);
  const [success, setSuccess] = useState(false);

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
        const fetchedQuote = resData.quote;
        const parsedQuote = {
          current: fetchedQuote.current.toFixed(2),
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
        setRate(parsedQuote.current);
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
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // useEffect - loading data
  if (!quote || !wallet) {
    return;
  }

  const submitHandler = (event) => {
    event.preventDefault();

    if (wallet.value >= valuePLN) {
      fetch('http://localhost:5000/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + props.token,
        },
        body: JSON.stringify({
          order: {
            type: 'buy',
            value: valueDolar,
            amount: amount,
            rate: rate,
            quoteId: quoteId,
          },
        }),
      })
        .then((res) => {
          if (res.status !== 200 && res.status !== 201) {
            console.log('Error!');
            throw new Error('Could not create an order!');
          }
          return res.json();
        })
        .then((resData) => {
          console.log(resData);
          setAmount('');
          setValueDolar(0);
          setValuePLN(0);
          setSuccess(true);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const clickHandler = () => {
    fetch('http://localhost:5000/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + props.token,
      },
      body: JSON.stringify({
        order: {
          type: 'sell',
          value: valueDolar,
          amount: amount,
          rate: rate,
          quoteId: quoteId,
        },
      }),
    })
      .then((res) => {
        if (res.status !== 200 && res.status !== 201) {
          console.log('Error!');
          throw new Error('Could not create an order!');
        }
        return res.json();
      })
      .then((resData) => {
        console.log(resData);
        setAmount('');
        setValueDolar(0);
        setValuePLN(0);
        setSuccess(true);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <Card className={classes.home}>
      <h1>Informacje</h1>
      <h4>{quote.company.symbol}</h4>
      <div>
        <p>Obecna cena: {quote.current}</p>
        <p>
          Zmiana: {quote.change} ({quote.percent_change}%)
        </p>
        <p>Najwyższa cena w dniu: {quote.high}</p>
        <p>Najniższa cena w dniu: {quote.low}</p>
        <p>Cena otwarcia: {quote.open}</p>
        <p>Cena zamknięcia: {quote.prev_close}</p>
      </div>
      <form onSubmit={submitHandler}>
        <div className={classes[`form-label`]}>
          {/* <label htmlFor='title'>Kwota: </label> */}
          <input
            type='number'
            name='amount'
            id='amount'
            onChange={(e) => {
              setAmount(e.target.value);
              setValueDolar(rate * e.target.value);
              setValuePLN(rate * e.target.value * 4.17);
              setSuccess(false);
            }}
            required
            min={1}
            value={amount}
            placeholder='Ilość akcji'
          />
        </div>
        <h4>Wartość:</h4>
        <p>{valueDolar.toFixed(2)} $</p>
        <p>{valuePLN.toFixed(2)} PLN</p>
        <div className={classes[`form-label`]}>
          {/* <label htmlFor='title'>Kwota: </label> */}
          <input
            type='number'
            name='price'
            id='price'
            onChange={(e) => {
              setRate(e.target.value);
              setValueDolar(e.target.value * amount);
              setValuePLN(e.target.value * amount * 4.17);
              setSuccess(false);
            }}
            required
            min={0.01}
            step={0.01}
            value={rate}
            placeholder='Kurs'
          />
        </div>
        <div className={classes.payment}>
          {wallet.value >= valuePLN ? (
            <h4 className={classes.green}>Wystarczająca ilość funduszy</h4>
          ) : (
            <h4 className={classes.red}>
              Brak funduszy -{' '}
              <Link to='/dashboard/wallet'>doładuj portfel </Link>
            </h4>
          )}
          <button type='submit'>Kup</button>
        </div>
      </form>
      <button onClick={clickHandler}>Sprzedaj</button>
      {success && <h2>Pomyślnie utworzono zlecenie!</h2>}
    </Card>
  );
};

export default QuoteDetails;
