import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useBasketStore } from '../store/basketStore';
import { Link } from 'react-router-dom';

const CartIcon = () => {
  const itemCount = useBasketStore((state) => state.itemCount());

  return (
    <div className="cart-icon-container relative">
      <Link 
        to="/basket" 
        className="text-gray-700 hover:text-gray-900 flex items-center"
        aria-label="View basket"
      >
        <ShoppingCartIcon className="h-5 w-5" />
        {itemCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </Link>
    </div>
  );
};

export default CartIcon;