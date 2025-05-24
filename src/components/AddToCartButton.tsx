import { useState } from 'react';
import { useBasketStore } from '../store/basketStore';

type SizeQuantity = {
  size: string;
  quantity: number;
};

type Product = {
  id: string;
  name: string;
  price: number;
  image?: string;
  description?: string;
  sizes?: string[];
};

type AddToCartButtonProps = {
  product: Product;
  className?: string;
  selectedSizes: SizeQuantity[];
  disabled?: boolean;
  onSizeRequired?: () => void;
  children?: React.ReactNode;
};

const AddToCartButton = ({ 
  product, 
  className = '', 
  selectedSizes = [],
  disabled = false,
  onSizeRequired,
  children
}: AddToCartButtonProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [showSizePrompt, setShowSizePrompt] = useState(false);
  const addItem = useBasketStore((state) => state.addItem);

  const handleAddToCart = () => {
    if (isAdding || isAdded) return;
    
    // Check if sizes are required but none selected
    if (product.sizes && selectedSizes.length === 0) {
      if (onSizeRequired) onSizeRequired();
      setShowSizePrompt(true);
      setTimeout(() => setShowSizePrompt(false), 3000);
      return;
    }
    
    setIsAdding(true);
    
    // Add items for each selected size and quantity
    selectedSizes.forEach(sizeQty => {
      // Add one line item for each quantity of this size
      for (let i = 0; i < sizeQty.quantity; i++) {
        const productWithSize = {
          ...product,
          size: sizeQty.size,
          // Add a unique ID for each line item to handle duplicates
          lineItemId: `${product.id}-${sizeQty.size}-${i}-${Date.now()}`
        };
        addItem(productWithSize);
      }
    });
    
    // Show "Adding to basket" for 1 second, then show "Added" for 1 second
    setTimeout(() => {
      setIsAdding(false);
      setIsAdded(true);
      
      // Reset after showing "Added"
      setTimeout(() => {
        setIsAdded(false);
      }, 1000);
    }, 1000);
  };

  const getTotalItems = () => {
    return selectedSizes.reduce((total, item) => total + item.quantity, 0);
  };

  const totalItems = getTotalItems();

  return (
    <div className="relative">
      <button
        onClick={handleAddToCart}
        disabled={isAdding || isAdded || disabled || totalItems === 0}
        className={`px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 ${
          (isAdding || isAdded || disabled || totalItems === 0) ? 'opacity-75' : ''
        } ${className}`}
      >
        {isAdding 
          ? 'Adding to basket...' 
          : isAdded 
            ? 'Added' 
            : children || (totalItems > 1 
              ? `Add ${totalItems} items to Cart`
              : totalItems === 1
                ? 'Add to Cart (1 item)'
                : 'Select size and quantity')}
      </button>
      
      {showSizePrompt && (
        <div className="absolute -top-10 left-0 right-0 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm">
          Please select at least one size and quantity
        </div>
      )}
    </div>
  );
};

export default AddToCartButton;
