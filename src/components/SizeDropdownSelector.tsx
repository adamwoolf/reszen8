import { useState } from 'react';

type SizeQuantity = {
  size: string;
  quantity: number;
};

type SizeDropdownSelectorProps = {
  sizes: string[];
  selectedSizes: SizeQuantity[];
  onSizeQuantityChange: (sizes: SizeQuantity[]) => void;
  className?: string;
};

const SizeDropdownSelector = ({
  sizes,
  selectedSizes = [],
  onSizeQuantityChange,
  className = '',
}: SizeDropdownSelectorProps) => {
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);

  const availableSizes = sizes.filter(
    size => !selectedSizes.some(item => item.size === size)
  );

  const addSize = () => {
    if (!selectedSize || quantity < 1) return;

    const existingIndex = selectedSizes.findIndex(item => item.size === selectedSize);
    let updatedSizes;

    if (existingIndex >= 0) {
      updatedSizes = [...selectedSizes];
      updatedSizes[existingIndex].quantity += quantity;
    } else {
      updatedSizes = [
        ...selectedSizes,
        { size: selectedSize, quantity }
      ];
    }

    onSizeQuantityChange(updatedSizes);
    setSelectedSize('');
    setQuantity(1);
  };

  const removeSize = (size: string) => {
    onSizeQuantityChange(selectedSizes.filter(item => item.size !== size));
  };

  const updateQuantity = (size: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    const updatedSizes = selectedSizes.map(item =>
      item.size === size ? { ...item, quantity: newQuantity } : item
    );
    onSizeQuantityChange(updatedSizes);
  };

  const removeOne = (size: string) => {
    const existingItem = selectedSizes.find(item => item.size === size);
    if (!existingItem) return;

    if (existingItem.quantity > 1) {
      updateQuantity(size, existingItem.quantity - 1);
    } else {
      removeSize(size);
    }
  };

  const addOne = (size: string) => {
    const existingItem = selectedSizes.find(item => item.size === size);
    if (existingItem) {
      updateQuantity(size, existingItem.quantity + 1);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Selected items */}
      <div className="space-y-2">
        {selectedSizes.map(({ size, quantity }) => (
          <div key={size} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
            <span className="font-medium">{size}</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => removeOne(size)}
                className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
              >
                -
              </button>
              <span className="w-8 text-center">{quantity}</span>
              <button
                onClick={() => addOne(size)}
                className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
              >
                +
              </button>
              <button
                onClick={() => removeSize(size)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add new size */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <select
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={availableSizes.length === 0}
          >
            <option value="">Select a size</option>
            {availableSizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-3 py-1 border rounded-l-md bg-gray-100 hover:bg-gray-200"
          >
            -
          </button>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-12 text-center border-t border-b border-gray-300 py-1"
          />
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="px-3 py-1 border rounded-r-md bg-gray-100 hover:bg-gray-200"
          >
            +
          </button>
        </div>

        <button
          onClick={addSize}
          disabled={!selectedSize}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Add
        </button>
      </div>
    </div>
  );
};

export default SizeDropdownSelector;
