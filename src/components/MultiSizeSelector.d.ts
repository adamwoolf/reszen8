import React from 'react';
interface SizeQuantity {
    size: string;
    quantity: number;
}
interface MultiSizeSelectorProps {
    sizes: string[];
    onSelectionChange: (selectedSizes: SizeQuantity[]) => void;
    className?: string;
}
declare const MultiSizeSelector: React.FC<MultiSizeSelectorProps>;
export default MultiSizeSelector;
