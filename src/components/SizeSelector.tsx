import { useState } from 'react';

type SizeSelectorProps = {
  sizes: string[];
  selectedSizes: string[];
  onSizeSelect: (sizes: string[]) => void;
  className?: string;
};

const SizeSelector = ({
  sizes,
  selectedSizes = [],
  onSizeSelect,
  className = '',
}: SizeSelectorProps) => {
  const toggleSize = (size: string) => {
    if (selectedSizes.includes(size)) {
      onSizeSelect(selectedSizes.filter(s => s !== size));
    } else {
      onSizeSelect([...selectedSizes, size]);
    }
  };

  return (
    <div className={`mb-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          Sizes: {selectedSizes.length > 0 ? selectedSizes.join(', ') : 'Select sizes'}
        </span>
        {selectedSizes.length > 0 && (
          <button
            type="button"
            onClick={() => onSizeSelect([])}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Clear all
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => (
          <button
            key={size}
            type="button"
            onClick={() => toggleSize(size)}
            className={`w-10 h-10 flex items-center justify-center border rounded-md text-sm font-medium transition-colors ${
              selectedSizes.includes(size)
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {size}
          </button>
        ))}
      </div>
      {selectedSizes.length === 0 && (
        <p className="mt-1 text-sm text-red-600">Please select at least one size</p>
      )}
    </div>
  );
};

export default SizeSelector;
