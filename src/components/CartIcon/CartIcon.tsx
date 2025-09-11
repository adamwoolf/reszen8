import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useBasketStore } from "../../store/basketStore";
import { Link } from "react-router-dom";
import "./CartIconStyles.css";
const CartIcon = () => {
  const itemCount = useBasketStore((state) => state.itemCount());

  return (
    <div className='cart-icon-container'>
      <Link to='/basket' aria-label='View basket'>
        <ShoppingCartIcon style={{ height: 20 }} />
        {itemCount > 0 && <span className='cart-icon-count'>{itemCount}</span>}
      </Link>
    </div>
  );
};

export default CartIcon;
