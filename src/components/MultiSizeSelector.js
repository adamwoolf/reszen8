import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
const MultiSizeSelector = ({ sizes, onSelectionChange, className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedSizes, setSelectedSizes] = useState([]);
    const [availableSizes, setAvailableSizes] = useState(sizes);
    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };
    const handleSizeSelect = (size) => {
        const existingIndex = selectedSizes.findIndex(item => item.size === size);
        if (existingIndex >= 0) {
            // Remove size if already selected
            const updatedSizes = selectedSizes.filter(item => item.size !== size);
            setSelectedSizes(updatedSizes);
            onSelectionChange(updatedSizes);
        }
        else {
            // Add new size with quantity 1
            const updatedSizes = [...selectedSizes, { size, quantity: 1 }];
            setSelectedSizes(updatedSizes);
            onSelectionChange(updatedSizes);
        }
    };
    const updateQuantity = (size, newQuantity) => {
        if (newQuantity < 1)
            return;
        const updatedSizes = selectedSizes.map(item => item.size === size ? { ...item, quantity: newQuantity } : item);
        setSelectedSizes(updatedSizes);
        onSelectionChange(updatedSizes);
    };
    const removeSize = (size) => {
        const updatedSizes = selectedSizes.filter(item => item.size !== size);
        setSelectedSizes(updatedSizes);
        onSelectionChange(updatedSizes);
    };
    return (_jsxs("div", { className: `relative ${className}`, children: [_jsx("button", { type: "button", onClick: toggleDropdown, className: "w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm", children: selectedSizes.length === 0
                    ? 'Select sizes & quantities'
                    : `${selectedSizes.length} size${selectedSizes.length !== 1 ? 's' : ''} selected` }), isOpen && (_jsx("div", { className: "absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg", children: _jsx("div", { className: "max-h-60 overflow-auto", children: sizes.map((size) => {
                        const selectedItem = selectedSizes.find(item => item.size === size);
                        const isSelected = !!selectedItem;
                        return (_jsx("div", { className: "px-4 py-2 hover:bg-gray-100 border-b border-gray-100", onClick: (e) => {
                                e.stopPropagation();
                                handleSizeSelect(size);
                            }, children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: isSelected ? 'font-medium' : '', children: size }), isSelected ? (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("button", { type: "button", onClick: (e) => {
                                                    e.stopPropagation();
                                                    updateQuantity(size, selectedItem.quantity - 1);
                                                }, className: "w-6 h-6 flex items-center justify-center border rounded text-gray-600 hover:bg-gray-200", children: "-" }), _jsx("span", { className: "w-8 text-center", children: selectedItem.quantity }), _jsx("button", { type: "button", onClick: (e) => {
                                                    e.stopPropagation();
                                                    updateQuantity(size, selectedItem.quantity + 1);
                                                }, className: "w-6 h-6 flex items-center justify-center border rounded text-gray-600 hover:bg-gray-200", children: "+" }), _jsx("button", { type: "button", onClick: (e) => {
                                                    e.stopPropagation();
                                                    removeSize(size);
                                                }, className: "text-red-500 hover:text-red-700 ml-2", children: "\u00D7" })] })) : (_jsx("button", { type: "button", onClick: (e) => {
                                            e.stopPropagation();
                                            handleSizeSelect(size);
                                        }, className: "text-blue-600 hover:text-blue-800", children: "Add" }))] }) }, size));
                    }) }) })), selectedSizes.length > 0 && (_jsx("div", { className: "mt-2 space-y-1", children: selectedSizes.map((item) => (_jsxs("div", { className: "flex justify-between items-center bg-gray-50 px-3 py-1 rounded", children: [_jsxs("span", { className: "text-sm", children: [item.size, ": ", item.quantity] }), _jsx("button", { onClick: () => removeSize(item.size), className: "text-red-500 hover:text-red-700", children: "\u00D7" })] }, item.size))) }))] }));
};
export default MultiSizeSelector;
