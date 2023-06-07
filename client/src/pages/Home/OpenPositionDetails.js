import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import Card from '../../components/UI/Card/Card';
import classes from './Wallet.module.css';
import MarketSellForm from '../../components/Form/MarketSellForm';

const OpenPositionDetails = (props) => {
  const [position, setPosition] = useState();
  const [success, setSuccess] = useState(false);
  const [isSelling, setIsSelling] = useState(false);
  const [isOrder, setIsOrder] = useState(false);

  const { positionId } = useParams();

  const fetchingPosition = () => {
    fetch('http://localhost:5000/open-positions/' + positionId, {
      headers: {
        Authorization: 'Bearer ' + props.token,
      },
    })
      .then((res) => {
        if (res.status !== 200) {
          throw new Error('Failed to fetch position');
        }
        return res.json();
      })
      .then((resData) => {
        const fetchedPosition = { ...resData.position };
        const parsedPosition = {
          id: fetchedPosition.id,
          type: 'Kup',
          volume: fetchedPosition.volume,
          value: fetchedPosition.value.toFixed(2),
          open_price: fetchedPosition.open_price.toFixed(2),
          profit: (
            fetchedPosition.volume * fetchedPosition.quote.sell * 4.17 -
            fetchedPosition.value * 4.17
          ).toFixed(2),
          percent_profit: (
            ((fetchedPosition.volume * fetchedPosition.quote.sell * 4.17 -
              fetchedPosition.value * 4.17) /
              (fetchedPosition.value * 4.17)) *
            100
          ).toFixed(2),
          createdAt: props.formatDate(new Date(fetchedPosition.createdAt)),
          quote: fetchedPosition.quote,
          company: fetchedPosition.quote.company,
        };
        setPosition(parsedPosition);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    fetchingPosition();
    const interval = setInterval(() => {
      fetchingPosition();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // useEffect - loading data
  if (!position) {
    return;
  }

  return (
    <Card className={classes.home}>
      <h1>Otwarta pozycja</h1>
      <h3>{position.company.symbol}</h3>
      <hr />
      <div>
        <p>
          <span className={classes['quote-info__title']}> Typ: </span>
          {position.type}
        </p>
        <p>
          <span className={classes['quote-info__title']}> Wolumen: </span>
          {position.volume}
        </p>
        <p>
          <span className={classes['quote-info__title']}> Wartość: </span>
          {position.value}
        </p>
        <p>
          <span className={classes['quote-info__title']}> Cena otwarcia: </span>
          {position.open_price}
        </p>
        <p>
          <span className={classes['quote-info__title']}>
            {' '}
            Cena sprzedaży:{' '}
          </span>
          {position.quote.sell.toFixed(2)}
        </p>
        <p>
          <span className={classes['quote-info__title']}> Zysk / strata: </span>
          {position.profit} zł ({position.percent_profit}%)
        </p>
        <p>
          <span className={classes['quote-info__title']}> Data zakupu: </span>
          {position.createdAt}
        </p>
      </div>

      <button
        onClick={() => {
          setIsSelling(true);
          setIsOrder(false);
          setSuccess(false);
        }}
        className={classes['btn-blue']}
      >
        Sprzedaż natychmiastowa
      </button>
      <button
        onClick={() => {
          setIsSelling(true);
          setIsOrder(true);
          setSuccess(false);
        }}
        className={classes['btn-blue']}
      >
        Zlecenie oczekujące
      </button>

      {isSelling && (
        <>
          <hr />
          {!isOrder && (
            <MarketSellForm
              token={props.token}
              type='sell'
              title='Sprzedaż natychmiastowa'
              position={position}
              isOrder={isOrder}
              onSuccess={setSuccess}
              onFinishOrder={setIsSelling}
            />
          )}
          {isOrder && (
            <MarketSellForm
              token={props.token}
              type='sell'
              title='Zlecenie oczekujące'
              position={position}
              isOrder={isOrder}
              onSuccess={setSuccess}
              onFinishOrder={setIsSelling}
            />
          )}
        </>
      )}
      {success && (
        <h2>
          {!isOrder
            ? 'Pomyślnie dokonano sprzedaży!'
            : 'Pomyślnie utworzono zlecenie!'}
        </h2>
      )}
    </Card>
  );
};

export default OpenPositionDetails;
