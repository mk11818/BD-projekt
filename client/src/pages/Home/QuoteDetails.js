import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

import Card from '../../components/UI/Card/Card';
import classes from './Wallet.module.css';

const QuoteDetails = (props) => {
  const [quote, setQuote] = useState();
  const [wallet, setWallet] = useState();
  const [quantity, setQuantity] = useState('');
  const [amountDolar, setAmountDolar] = useState(0);
  const [amountPLN, setAmountPLN] = useState(0);
  const [price, setPrice] = useState(0);

  const { quoteId } = useParams();

  useEffect(() => {
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
        console.log(resData);
        setQuote(resData.quote);
        setPrice(resData.quote.current);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [props.token]);

  useEffect(() => {
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
  }, [props.token]);

  // useEffect - loading data
  if (!quote || !wallet) {
    return;
  }

  const submitHandler = (event) => {
    event.preventDefault();

    if (wallet.value >= amountPLN) {
      // Fetch create order endpoint
    }
  };

  return (
    <Card className={classes.home}>
      <h1>Informacje</h1>
      <h4>{quote.company.symbol}</h4>
      <div>
        <p>Obecna cena: {quote.current}</p>
        <p>
          Zmiana: {quote.change} ({quote.percent_change.toFixed(2)}%)
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
              setQuantity(e.target.value);
              setAmountDolar(price * e.target.value);
              setAmountPLN(price * e.target.value * 4.17);
            }}
            required
            min={1}
            value={quantity}
            placeholder='Ilość akcji'
          />
        </div>
        <h4>Wartość:</h4>
        <p>{amountDolar.toFixed(2)} $</p>
        <p>{amountPLN.toFixed(2)} PLN</p>
        <div className={classes[`form-label`]}>
          {/* <label htmlFor='title'>Kwota: </label> */}
          <input
            type='number'
            name='price'
            id='price'
            onChange={(e) => {
              setPrice(e.target.value);
              setAmountDolar(e.target.value * quantity);
              setAmountPLN(e.target.value * quantity * 4.17);
            }}
            required
            min={1}
            step={0.01}
            value={price}
            placeholder='Kurs'
          />
        </div>
        <div className={classes.payment}>
          {wallet.value >= amountPLN ? (
            <p className={classes.green}>Wystarczająca ilość funduszy</p>
          ) : (
            <p className={classes.red}>
              Brak funduszy -{' '}
              <Link to='/dashboard/wallet'>doładuj portfel </Link>
            </p>
          )}
          <button type='submit'>Kup</button>
        </div>
      </form>
    </Card>
  );
};

export default QuoteDetails;
