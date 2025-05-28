import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
const SizeSelector = ({ sizes, selectedSizes = [], onSizeSelect, className = '', }) => {
    const toggleSize = (size) => {
        if (selectedSizes.includes(size)) {
            onSizeSelect(selectedSizes.filter(s => s !== size));
        }
        else {
            onSizeSelect([...selectedSizes, size]);
        }
    };
    return (_jsxs("div", { className: `mb-4 ${className}`, children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("span", { className: "text-sm font-medium text-gray-700", children: ["Sizes: ", selectedSizes.length > 0 ? selectedSizes.join(', ') : 'Select sizes'] }), selectedSizes.length > 0 && (_jsx("button", { type: "button", onClick: () => onSizeSelect([]), className: "text-xs text-blue-600 hover:text-blue-800", children: "Clear all" }))] }), _jsx("div", { className: "flex flex-wrap gap-2", children: sizes.map((size) => (_jsx("button", { type: "button", onClick: () => toggleSize(size), className: `w-10 h-10 flex items-center justify-center border rounded-md text-sm font-medium transition-colors ${selectedSizes.includes(size)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50'}`, children: size }, size))) }), selectedSizes.length === 0 && (_jsx("p", { className: "mt-1 text-sm text-red-600", children: "Please select at least one size" }))] }));
};
export default SizeSelector;
