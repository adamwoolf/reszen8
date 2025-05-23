import { useState } from 'react';

type SizeQuantity = {
  size: string;
  quantity: number;
};

type SizeQuantitySelectorProps = {
  sizes: string[];
  selectedSizes: SizeQuantity[];
  onSizeQuantityChange: (sizes: SizeQuantity[]) => void;
  className?: string;
};

const SizeQuantitySelector = ({
  sizes,
  selectedSizes = [],
  onSizeQuantityChange,
  className = '',
}: SizeQuantitySelectorProps) => {
  const [showAllSizes, setShowAllSizes] = useState(false);

  const updateQuantity = (size: string, newQuantity: number) => {
    const updatedSizes = [...selectedSizes];
    const existingIndex = updatedSizes.findIndex(item => item.size === size);
    
    if (newQuantity > 0) {
      if (existingIndex >= 0) {
        updatedSizes[existingIndex] = { size, quantity: newQuantity };
      } else {
        updatedSizes.push({ size, quantity: newQuantity });
      }
    } else {
      if (existingIndex >= 0) {
        updatedSizes.splice(existingIndex, 1);
      }
    }
    
    onSizeQuantityChange(updatedSizes);
  };

  const getQuantity = (size: string) => {
    const item = selectedSizes.find(item => item.size === size);
    return item ? item.quantity : 0;
  };

  const toggleSize = (size: string) => {
    const currentQty = getQuantity(size);
    updateQuantity(size, currentQty > 0 ? 0 : 1);
  };

  const visibleSizes = showAllSizes ? sizes : sizes.slice(0, 6);
  const hasMoreSizes = sizes.length > 6;

  return (
    <div className={`mb-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          {selectedSizes.length > 0 
            ? selectedSizes.map(item => `${item.size} (${item.quantity})`).join(', ')
            : 'Select sizes and quantities'}
        </span>
        {selectedSizes.length > 0 && (
          <button
            type="button"
            onClick={() => onSizeQuantityChange([])}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Clear all
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-3 gap-2 mb-2">
        {visibleSizes.map((size) => {
          const quantity = getQuantity(size);
          const isSelected = quantity > 0;
          
          return (
            <div 
              key={size} 
              className={`border rounded-md p-2 transition-colors ${
                isSelected 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{size}</span>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateQuantity(size, Math.max(0, quantity - 1));
                    }}
                    className="w-6 h-6 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-200"
                    disabled={!isSelected}
                  >
                    -
                  </button>
                  <span className="mx-2 w-4 text-center">{quantity}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateQuantity(size, quantity + 1);
                    }}
                    className="w-6 h-6 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-200"
                  >
                    +
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggleSize(size)}
                className={`w-full text-xs py-1 rounded ${
                  isSelected
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {isSelected ? 'Remove' : 'Add'}
              </button>
            </div>
          );
        })}
      </div>
      
      {hasMoreSizes && !showAllSizes && (
        <button
          type="button"
          onClick={() => setShowAllSizes(true)}
          className="text-xs text-blue-600 hover:text-blue-800 mt-1"
        >
          Show all sizes
        </button>
      )}
      
      {selectedSizes.length === 0 && (
        <p className="mt-1 text-sm text-red-600">Please select at least one size</p>
      )}
    </div>
  );
};

export default SizeQuantitySelector;
