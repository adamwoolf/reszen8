import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
const QuantitySelector = ({ initialQuantity = 1, min = 1, max = 10, onQuantityChange, className = '', }) => {
    const [quantity, setQuantity] = useState(initialQuantity);
    const handleIncrement = () => {
        const newQuantity = Math.min(quantity + 1, max);
        setQuantity(newQuantity);
        onQuantityChange(newQuantity);
    };
    const handleDecrement = () => {
        const newQuantity = Math.max(quantity - 1, min);
        setQuantity(newQuantity);
        onQuantityChange(newQuantity);
    };
    return (_jsxs("div", { className: `flex items-center border border-gray-300 rounded-md overflow-hidden ${className}`, children: [_jsx("button", { type: "button", onClick: handleDecrement, className: "px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium focus:outline-none", disabled: quantity <= min, children: "-" }), _jsx("span", { className: "px-3 py-1 bg-white text-center w-10", children: quantity }), _jsx("button", { type: "button", onClick: handleIncrement, className: "px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium focus:outline-none", disabled: quantity >= max, children: "+" })] }));
};
export default QuantitySelector;
