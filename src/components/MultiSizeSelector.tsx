import React, { useState } from 'react';

interface SizeQuantity {
  size: string;
  quantity: number;
}

interface MultiSizeSelectorProps {
  sizes: string[];
  onSelectionChange: (selectedSizes: SizeQuantity[]) => void;
  className?: string;
}

const MultiSizeSelector: React.FC<MultiSizeSelectorProps> = ({ 
  sizes, 
  onSelectionChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<SizeQuantity[]>([]);
  const [availableSizes, setAvailableSizes] = useState<string[]>(sizes);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleSizeSelect = (size: string) => {
    const existingIndex = selectedSizes.findIndex(item => item.size === size);
    
    if (existingIndex >= 0) {
      // Remove size if already selected
      const updatedSizes = selectedSizes.filter(item => item.size !== size);
      setSelectedSizes(updatedSizes);
      onSelectionChange(updatedSizes);
    } else {
      // Add new size with quantity 1
      const updatedSizes = [...selectedSizes, { size, quantity: 1 }];
      setSelectedSizes(updatedSizes);
      onSelectionChange(updatedSizes);
    }
  };

  const updateQuantity = (size: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const updatedSizes = selectedSizes.map(item => 
      item.size === size ? { ...item, quantity: newQuantity } : item
    );
    
    setSelectedSizes(updatedSizes);
    onSelectionChange(updatedSizes);
  };

  const removeSize = (size: string) => {
    const updatedSizes = selectedSizes.filter(item => item.size !== size);
    setSelectedSizes(updatedSizes);
    onSelectionChange(updatedSizes);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={toggleDropdown}
        className="w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      >
        {selectedSizes.length === 0 
          ? 'Select sizes & quantities' 
          : `${selectedSizes.length} size${selectedSizes.length !== 1 ? 's' : ''} selected`}
      </button>
      
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg">
          <div className="max-h-60 overflow-auto">
            {sizes.map((size) => {
              const selectedItem = selectedSizes.find(item => item.size === size);
              const isSelected = !!selectedItem;
              
              return (
                <div 
                  key={size}
                  className="px-4 py-2 hover:bg-gray-100 border-b border-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSizeSelect(size);
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span className={isSelected ? 'font-medium' : ''}>{size}</span>
                    {isSelected ? (
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateQuantity(size, selectedItem.quantity - 1);
                          }}
                          className="w-6 h-6 flex items-center justify-center border rounded text-gray-600 hover:bg-gray-200"
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{selectedItem.quantity}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateQuantity(size, selectedItem.quantity + 1);
                          }}
                          className="w-6 h-6 flex items-center justify-center border rounded text-gray-600 hover:bg-gray-200"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSize(size);
                          }}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSizeSelect(size);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Add
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {selectedSizes.length > 0 && (
        <div className="mt-2 space-y-1">
          {selectedSizes.map((item) => (
            <div key={item.size} className="flex justify-between items-center bg-gray-50 px-3 py-1 rounded">
              <span className="text-sm">{item.size}: {item.quantity}</span>
              <button
                onClick={() => removeSize(item.size)}
                className="text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSizeSelector;
