import Card from '../../components/UI/Card/Card';
import classes from './Wallet.module.css';

const Wallet = () => {
  return (
    <Card className={classes.home}>
      <h1>Portfel</h1>
      <h4>0.00 PLN</h4>

      <div className={classes.payment}>
        <button>Wpłać środki</button>
        <button>Wypłać środki</button>
      </div>
    </Card>
  );
};

export default Wallet;
