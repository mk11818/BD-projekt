import { useState } from 'react';
import { Link } from 'react-router-dom';

import classes from './MarketForm.module.css';

const MarketForm = (props) => {
  const [volume, setVolume] = useState();
  const [valueDolar, setValueDolar] = useState(0);
  const [valuePLN, setValuePLN] = useState(0);
  const [priceBuy, setPriceBuy] = useState(props.quote.buy);

  const submitHandler = (event) => {
    event.preventDefault();

    if (props.wallet.value >= valuePLN) {
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
            price: priceBuy,
            quoteId: props.quote.id,
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
            setValueDolar(props.quote.buy * e.target.value);
            setValuePLN(props.quote.buy * e.target.value * 4.17);
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
          <label htmlFor='price'>Kup, gdy kurs wynosi: </label> <br />
          <input
            type='number'
            name='price'
            id='price'
            onChange={(e) => {
              setPriceBuy(e.target.value);
              setValueDolar(e.target.value * volume);
              setValuePLN(e.target.value * volume * 4.17);
              props.onSuccess(false);
            }}
            required
            min={0.01}
            step={0.01}
            value={priceBuy}
            placeholder='Kurs'
          />
        </div>
      )}

      <h4>Wartość:</h4>
      <p>{valueDolar.toFixed(2)} $</p>
      <p>{valuePLN.toFixed(2)} PLN</p>
      <div className={classes.payment}>
        {props.wallet.value >= valuePLN ? (
          <h4 className={classes.green}>Wystarczająca ilość funduszy</h4>
        ) : (
          <h4 className={classes.red}>
            Brak funduszy - <Link to='/dashboard/wallet'>doładuj portfel </Link>
          </h4>
        )}
        <button type='submit' className={classes['btn-green']}>
          {!props.isOrder && `Kup (${priceBuy})`}
          {props.isOrder && 'Złóż zlecenie'}
        </button>
      </div>
    </form>
  );
};

export default MarketForm;
