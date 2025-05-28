import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useBasketStore } from "../../store/basketStore";
import { Link } from "react-router-dom";
import "./CartIconStyles.css";
const CartIcon = () => {
    const itemCount = useBasketStore((state) => state.itemCount());
    return (_jsx("div", { className: 'cart-icon-container', children: _jsxs(Link, { to: '/basket', "aria-label": 'View basket', children: [_jsx(ShoppingCartIcon, { style: { height: 20 } }), itemCount > 0 && _jsx("span", { className: 'cart-icon-count', children: itemCount })] }) }));
};
export default CartIcon;
