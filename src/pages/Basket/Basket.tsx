import React from "react";
import { useBasketStore } from "../../store/basketStore";
import { FaTrash, FaMinus, FaPlus } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./BasketStyles.css";

interface BasketItem {
  id: string;
  name?: string;
  price?: number;
  quantity?: number;
  description?: string;
}

const Basket = () => {
  const { items, removeItem, updateQuantity, clearBasket, totalPrice } = useBasketStore();

  const subtotal = totalPrice();
  const shipping = subtotal > 0 ? 3.99 : 0;
  const total = subtotal + shipping;

  const handleQuantityChange = (productId: string, size?: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(productId, size, newQuantity);
  };

  if (!items || items.length === 0) {
    return (
      <div className='max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8'>
        <div className='text-center'>
          <h1 className='text-3xl font-bold text-gray-900 mb-4'>Your Basket is Empty</h1>
          <p className='text-gray-600 mb-8'>Looks like you haven't added any items yet.</p>
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
    <div className='bg-gray-50 py-12'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <h1 className='text-3xl font-bold text-gray-900 mb-8'>Your Basket</h1>

        <div className='bg-white shadow overflow-hidden sm:rounded-lg'>
          <div className='px-4 py-5 sm:px-6 border-b border-gray-200'>
            <h2 className='text-lg font-medium text-gray-900'>Order Summary</h2>
          </div>

          <div className=''>
            {items.map((item, i) => (
              <div key={item.product.id + i} className='basket-item'>
                <div className='p-6 h-full flex flex-col'>
                  <div className='flex-grow'>
                    <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                      {item.product?.name || "Unnamed Item"} {item.product?.size && `- ${item.product?.size}`}
                    </h3>
                    {item.product.description && (
                      <p className='text-sm text-gray-500 mb-3'>{item.product.description}</p>
                    )}
                    <div className='flex items-baseline mt-2'>
                      <span className='text-lg font-bold text-gray-900'>
                        £{(item.product.price * item.quantity).toFixed(2)}
                      </span>
                      {item.quantity > 1 && (
                        <span className='ml-2 text-sm text-gray-500'>(£{item.product.price.toFixed(2)} each)</span>
                      )}
                    </div>
                  </div>

                  <div className='basket-item-controls'>
                    <div className='flex items-center justify-between mb-4'>
                      <span className='text-sm font-medium text-gray-700'>Quantity</span>
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
                        <span className='w-10 text-center text-sm font-medium'>{item.quantity}</span>
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
                        <button
                          type='button'
                          className='remove-button'
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
            ))}
          </div>

          <div className='border-t border-gray-200 px-6 py-6'>
            <div className='flex justify-between text-base font-medium text-gray-900 mb-4'>
              <p>Subtotal</p>
              <p>£{subtotal.toFixed(2)}</p>
            </div>
            <div className='flex justify-between text-base font-medium text-gray-900 mb-4'>
              <p>Shipping</p>
              <p>{shipping > 0 ? `£${shipping.toFixed(2)}` : "Free"}</p>
            </div>
            <div className='flex justify-between text-lg font-bold text-gray-900 pt-4 border-t border-gray-200'>
              <p>Total</p>
              <p>£{total.toFixed(2)}</p>
            </div>

            <div className='mt-6 flex justify-end space-x-4'>
              <button
                type='button'
                onClick={clearBasket}
                className='px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500'
              >
                Clear Basket
              </button>
              <Link
                to='/checkout'
                className='flex justify-center items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500'
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Basket;
