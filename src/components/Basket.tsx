import { useBasketStore } from '../store/basketStore';
import { Link } from 'react-router-dom';
import styles from './Basket.module.css';

const Basket = () => {
  const { 
    items, 
    removeItem, 
    updateQuantity, 
    totalPrice, 
    clearBasket 
  } = useBasketStore();

  if (items.length === 0) {
    return (
      <div className={styles.emptyBasket}>
        <h2 className={styles.emptyBasketTitle}>Your Basket</h2>
        <p className={styles.emptyBasketText}>Your basket is empty</p>
      </div>
    );
  }

  return (
    <div className={styles.basketContainer}>
      <div className={styles.basketHeader}>
        <h2 className={styles.basketTitle}>Your Basket</h2>
        <button
          onClick={clearBasket}
          className={styles.clearButton}
        >
          Clear Basket
        </button>
      </div>

      <div className={styles.itemsList}>
        {items.map((item) => (
          <div 
            key={item.product.id}
            className={styles.basketItem}
          >
            {item.product.image && (
              <img
                src={item.product.image}
                alt={item.product.name}
                className={styles.productImage}
              />
            )}
            <div className={styles.itemDetails}>
              <h3 className={styles.productName}>{item.product.name}</h3>
              <p className={styles.price}>${item.product.price.toFixed(2)}</p>
              <div className={styles.quantityControl}>
                <button
                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                  className={styles.quantityButton}
                >
                  -
                </button>
                <span className={styles.quantityValue}>
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                  className={`${styles.quantityButton} ${styles.quantityButtonRight}`}
                >
                  +
                </button>
              </div>
            </div>
            <div className={styles.itemTotal}>
              <p className={styles.totalPrice}>
                ${(item.product.price * item.quantity).toFixed(2)}
              </p>
              <button
                onClick={() => removeItem(item.product.id)}
                className={styles.removeButton}
              >
X
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.checkoutSection}>
        <div className={styles.totalContainer}>
          <span className={styles.totalLabel}>Total:</span>
          <span className={styles.totalAmount}>${totalPrice().toFixed(2)}</span>
        </div>
        <Link
          to="/checkout"
          className={styles.checkoutButton}
        >
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
};

export default Basket;
