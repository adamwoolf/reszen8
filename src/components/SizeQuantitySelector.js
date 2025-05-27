import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
const SizeQuantitySelector = ({ sizes, selectedSizes = [], onSizeQuantityChange, className = '', }) => {
    const [showAllSizes, setShowAllSizes] = useState(false);
    const updateQuantity = (size, newQuantity) => {
        const updatedSizes = [...selectedSizes];
        const existingIndex = updatedSizes.findIndex(item => item.size === size);
        if (newQuantity > 0) {
            if (existingIndex >= 0) {
                updatedSizes[existingIndex] = { size, quantity: newQuantity };
            }
            else {
                updatedSizes.push({ size, quantity: newQuantity });
            }
        }
        else {
            if (existingIndex >= 0) {
                updatedSizes.splice(existingIndex, 1);
            }
        }
        onSizeQuantityChange(updatedSizes);
    };
    const getQuantity = (size) => {
        const item = selectedSizes.find(item => item.size === size);
        return item ? item.quantity : 0;
    };
    const toggleSize = (size) => {
        const currentQty = getQuantity(size);
        updateQuantity(size, currentQty > 0 ? 0 : 1);
    };
    const visibleSizes = showAllSizes ? sizes : sizes.slice(0, 6);
    const hasMoreSizes = sizes.length > 6;
    return (_jsxs("div", { className: `mb-4 ${className}`, children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-sm font-medium text-gray-700", children: selectedSizes.length > 0
                            ? selectedSizes.map(item => `${item.size} (${item.quantity})`).join(', ')
                            : 'Select sizes and quantities' }), selectedSizes.length > 0 && (_jsx("button", { type: "button", onClick: () => onSizeQuantityChange([]), className: "text-xs text-blue-600 hover:text-blue-800", children: "Clear all" }))] }), _jsx("div", { className: "grid grid-cols-3 gap-2 mb-2", children: visibleSizes.map((size) => {
                    const quantity = getQuantity(size);
                    const isSelected = quantity > 0;
                    return (_jsxs("div", { className: `border rounded-md p-2 transition-colors ${isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'}`, children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsx("span", { className: "text-sm font-medium", children: size }), _jsxs("div", { className: "flex items-center", children: [_jsx("button", { type: "button", onClick: (e) => {
                                                    e.stopPropagation();
                                                    updateQuantity(size, Math.max(0, quantity - 1));
                                                }, className: "w-6 h-6 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-200", disabled: !isSelected, children: "-" }), _jsx("span", { className: "mx-2 w-4 text-center", children: quantity }), _jsx("button", { type: "button", onClick: (e) => {
                                                    e.stopPropagation();
                                                    updateQuantity(size, quantity + 1);
                                                }, className: "w-6 h-6 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-200", children: "+" })] })] }), _jsx("button", { type: "button", onClick: () => toggleSize(size), className: `w-full text-xs py-1 rounded ${isSelected
                                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`, children: isSelected ? 'Remove' : 'Add' })] }, size));
                }) }), hasMoreSizes && !showAllSizes && (_jsx("button", { type: "button", onClick: () => setShowAllSizes(true), className: "text-xs text-blue-600 hover:text-blue-800 mt-1", children: "Show all sizes" })), selectedSizes.length === 0 && (_jsx("p", { className: "mt-1 text-sm text-red-600", children: "Please select at least one size" }))] }));
};
export default SizeQuantitySelector;
