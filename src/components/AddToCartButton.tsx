import { useState } from 'react';
import { useBasketStore } from '../store/basketStore';

type Product = {
  id: string;
  name: string;
  price: number;
  image?: string;
  description?: string;
};

type AddToCartButtonProps = {
  product: Product;
  className?: string;
};

const AddToCartButton = ({ product, className = '' }: AddToCartButtonProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const addItem = useBasketStore((state) => state.addItem);

  const handleAddToCart = () => {
    setIsAdding(true);
    addItem(product);
    
    // Reset button state after animation
    setTimeout(() => {
      setIsAdding(false);
    }, 1000);
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={isAdding}
      className={`relative overflow-hidden px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 ${className} ${
        isAdding ? 'opacity-75' : ''
      }`}
    >
      <span className={`transition-all duration-300 ${isAdding ? 'opacity-0' : 'opacity-100'}`}>
        Add to Cart
      </span>
      <span 
        className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
          isAdding ? 'opacity-100' : 'opacity-0 -translate-y-4'
        }`}
      >
        Added!
      </span>
    </button>
  );
};

export default AddToCartButton;
