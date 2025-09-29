import React from "react";
import { useBasketStore } from "../../store/basketStore";
import { FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./BasketStyles.scss";
import { motion, AnimatePresence } from "framer-motion";
import { useSavedItemsStore } from "../../store/savedItemsStore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../contexts/AuthContext";

interface BasketItem {
  id: string;
  name?: string;
  price?: number;
  quantity?: number;
  description?: string;
  size?: string;
}

const Basket = () => {
  const { currentUser } = useAuth();
  const { items, removeItem, updateQuantity, clearBasket, totalPrice } = useBasketStore();
  const { saveItem } = useSavedItemsStore();
  const subtotal = totalPrice();
  const total = subtotal;

  const handleQuantityChange = (productId: string, size: string | undefined, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(productId, size, newQuantity);
  };
  console.log(items);
  if (!items || items.length === 0) {
    return (
      <div className=''>
        <div className='text-center'>
          <h1 className=''>Your Basket is Empty</h1>
          <p className=''>Looks like you haven't added any items yet.</p>
          <Link
            to='/memberships'
            className='inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500'
          >
            Browse Memberships
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='basket__page'>
      <h1 className=''>Your Basket</h1>

      <div className=''>
        {/* <div className=''>
          <h2 className=''>Order Summary</h2>
        </div> */}

        <div className='basket-grid'>
          <AnimatePresence>
            {items.map((item, i) => (
              <motion.div
                key={item.product.id + i}
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -100 }}
                transition={{ duration: 0.3 }}
                style={{ marginBottom: "10px" }}
              >
                <div className='basket-item'>
                  <div className=''>
                    <div className=''>
                      <h3 className=''>
                        {item.product?.name || "Membership"}
                        {item.product?.size && ` (${item.product.size})`}
                      </h3>
                      {item.product.description && <p className=''>{item.product.description}</p>}
                      <div className=''>
                        <span className='basket-item-total'>£{(item.product.price * item.quantity).toFixed(2)}</span>
                        {item.quantity > 1 && (
                          <span className='basket-quantity-total'>(£{item.product.price.toFixed(2)} each)</span>
                        )}
                      </div>
                    </div>

                    <div className='basket-item-controls'>
                      <div>
                        {/* <span className=''>Quantity</span> */}
                        {/* {item.product.type !== "subscription" && (
                          <div className='quantity-container'>
                            <button
                              type='button'
                              className='button quantity-button'
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuantityChange(item.product.id, item.product.size, item.quantity - 1);
                              }}
                            >
                              -
                            </button>
                            <span>{item.quantity}</span>
                            <button
                              type='button'
                              className='button quantity-button'
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuantityChange(item.product.id, item.product.size, item.quantity + 1);
                              }}
                            >
                              +
                            </button>
                          </div>
                        )} */}
                        <div className='item-save-or-remove-container'>
                          <button
                            type='button'
                            className='basket-remove-button'
                            onClick={(e) => {
                              e.stopPropagation();
                              removeItem(item.product.id, item.product.size);
                            }}
                          >
                            <FaTrash size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className=''>
          <div className=''>
            <p>Total</p>
            <p>£{total.toFixed(2)}</p>
          </div>

          <div className=''>
            <button type='button' onClick={clearBasket} className='basket__clear-button'>
              Clear Basket
            </button>
            <Link className='basket__proceed' to='/checkout'>
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Basket;
