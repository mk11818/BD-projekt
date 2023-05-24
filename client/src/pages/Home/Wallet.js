import React, { useEffect, useState } from 'react';

import { FaArrowUp } from 'react-icons/fa';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

import Card from '../../components/UI/Card/Card';
import classes from './Wallet.module.css';

const Wallet = (props) => {
  const [isPayment, setIsPayment] = useState(false);
  const [amount, setAmount] = useState('');
  const [value, setValue] = useState(0);

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
        setValue(resData.value);
        console.log(resData);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [props.token, isPayment]);

  const createOrder = function () {
    return fetch('http://localhost:5000/fill-wallet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + props.token,
      },
      body: JSON.stringify({
        items: [
          {
            id: 1,
            price: amount,
            quantity: 1,
          },
        ],
      }),
    })
      .then((res) => {
        if (res.ok) return res.json();
        return res.json().then((json) => Promise.reject(json));
      })
      .then(({ id }) => {
        setIsPayment(false);
        setAmount('');
        console.log(id);
      })
      .catch((e) => {
        console.error(e.error);
      });
  };

  const onApprove = function (data, actions) {
    return actions.order.capture();
  };

  const submitHandler = (event) => {
    event.preventDefault();

    if (amount > 0) {
      setIsPayment(true);
    }

    // setPrice((...prevPrice) => {
    //   return parseInt(prevPrice) + parseInt(amount);
    // });
  };

  return (
    <Card className={classes.home}>
      <h1>Portfel</h1>
      <h4>{value} PLN</h4>

      <form onSubmit={submitHandler}>
        <div className={classes[`form-label`]}>
          {/* <label htmlFor='title'>Kwota: </label> */}
          <input
            type='number'
            name='amount'
            id='amount'
            onChange={(e) => {
              setAmount(e.target.value);
            }}
            required
            min={0}
            value={amount}
            placeholder='Kwota'
          />
        </div>
        <div className={classes.payment}>
          <button type='submit'>
            <FaArrowUp /> Wpłać środki
          </button>
          {/* <button>
            <FaArrowDown /> Wypłać środki
          </button> */}
        </div>
      </form>

      {isPayment && (
        <div className={classes['payment-method']}>
          <h2>Wybierz metodę płatności</h2>
          <PayPalScriptProvider
            options={{
              'client-id':
                'ATqd7kD-q7fFziV37-qm_dz47xKs1n4uO7rwog55b4jziuCKTsbg5gtpUxvXYBXxG-ri2U5dCyNrPjRD',
              currency: 'PLN',
            }}
          >
            <PayPalButtons
              style={{ layout: 'horizontal', color: 'blue' }}
              createOrder={createOrder}
              onApprove={onApprove}
            />
          </PayPalScriptProvider>
        </div>
      )}
    </Card>
  );
};

export default Wallet;
