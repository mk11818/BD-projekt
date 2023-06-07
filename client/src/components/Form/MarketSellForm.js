import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import classes from './MarketForm.module.css';

const MarketSellForm = (props) => {
  const [volume, setVolume] = useState();
  const [valueDolar, setValueDolar] = useState(0);
  const [valuePLN, setValuePLN] = useState(0);
  const [priceSell, setPriceSell] = useState();

  useEffect(() => {
    setVolume(props.position.volume);
    setPriceSell(props.position.quote.sell.toFixed(2));
    setValueDolar(props.position.volume * props.position.quote.sell);
    setValuePLN(props.position.volume * props.position.quote.sell * 4.17);
  }, []);

  const submitHandler = (event) => {
    event.preventDefault();

    if (props.position.volume >= volume) {
      fetch('http://localhost:5000/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + props.token,
        },
        body: JSON.stringify({
          order: {
            type: props.type,
            volume: volume,
            value: valueDolar,
            price: priceSell,
            quoteId: props.position.quote.id,
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
          setVolume('');
          setValueDolar(0);
          setValuePLN(0);
          props.onSuccess(true);
          props.onFinishOrder(false);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  return (
    <form onSubmit={submitHandler} className={classes['market-form']}>
      <h2>{props.title}</h2>
      <div className={classes[`form-label`]}>
        <label htmlFor='title'>Wolumen</label> <br />
        <input
          type='number'
          name='volume'
          id='volume'
          onChange={(e) => {
            setVolume(e.target.value);
            setValueDolar(priceSell * e.target.value);
            setValuePLN(priceSell * e.target.value * 4.17);
            props.onSuccess(false);
          }}
          required
          min={1}
          step={1}
          value={volume}
          placeholder='Ilość akcji'
        />
      </div>
      {props.isOrder && (
        <div className={classes[`form-label`]}>
          <label htmlFor='price'>Sprzedaj, gdy kurs wynosi: </label> <br />
          <input
            type='number'
            name='price'
            id='price'
            onChange={(e) => {
              setPriceSell(e.target.value);
              setValueDolar(e.target.value * volume);
              setValuePLN(e.target.value * volume * 4.17);
              props.onSuccess(false);
            }}
            required
            min={0.01}
            step={0.01}
            value={priceSell}
            placeholder='Kurs'
          />
        </div>
      )}

      <h4>Wartość:</h4>
      <p>{valueDolar.toFixed(2)} $</p>
      <p>{valuePLN.toFixed(2)} PLN</p>
      <div className={classes.payment}>
        {props.position.volume >= volume ? (
          <h4 className={classes.green}>Wystarczająca ilość wolumenów</h4>
        ) : (
          <h4 className={classes.red}>
            Brak wolumenów -{' '}
            <Link to={'/dashboard/' + props.position.quote.id}>
              zakup akcje{' '}
            </Link>
          </h4>
        )}
        <button type='submit' className={classes['btn-red']}>
          {!props.isOrder && `Sprzedaj (${priceSell})`}
          {props.isOrder && 'Złóż zlecenie'}
        </button>
      </div>
    </form>
  );
};

export default MarketSellForm;
