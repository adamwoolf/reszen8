import React from 'react';
import { useBasketStore } from '../store/basketStore';
import { Link } from 'react-router-dom';

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

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(productId, newQuantity);
  };

  if (!items || items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Basket is Empty</h1>
          <p className="text-gray-600 mb-8">Looks like you haven't added any items yet.</p>
          <Link
            to="/memberships"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            Browse Memberships
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-6 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Your Basket</h1>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-4 sm:py-5 sm:px-6 border-b border-gray-200">
            <h2 className="text-base sm:text-lg font-medium text-gray-900">Order Summary</h2>
          </div>
          
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {items.map((item) => (
                <div key={item.product.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200 h-full">
                  <div className="p-4 sm:p-6 h-full flex flex-col">
                    <div className="flex-grow">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                        {item.product?.name || 'Unnamed Item'}
                      </h3>
                      {item.product.description && (
                        <p className="text-xs sm:text-sm text-gray-500 mb-3 line-clamp-2">
                          {item.product.description}
                        </p>
                      )}
                      <div className="flex items-baseline mt-2">
                        <span className="text-base sm:text-lg font-bold text-gray-900">
                          £{(item.product.price * item.quantity).toFixed(2)}
                        </span>
                        {item.quantity > 1 && (
                          <span className="ml-2 text-xs sm:text-sm text-gray-500">
                            (£{item.product.price.toFixed(2)} each)
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs sm:text-sm font-medium text-gray-700">Qty:</span>
                        <div className="flex items-center">
                          <button
                            type="button"
                            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 border border-gray-300 rounded-l-md"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuantityChange(item.product.id, item.quantity - 1);
                            }}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleQuantityChange(item.product.id, Number(e.target.value));
                            }}
                            className="w-12 text-center border-t border-b border-gray-300 text-gray-700 py-1 px-2 leading-tight focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-sm h-8"
                          />
                          <button
                            type="button"
                            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 border border-gray-300 rounded-r-md"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuantityChange(item.product.id, item.quantity + 1);
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs border-t border-gray-100 pt-3">
                        <button
                          type="button"
                          className="text-blue-600 hover:text-blue-800 hover:underline py-1 px-2 -mx-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Add save for later functionality here
                          }}
                        >
                          Save
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          type="button"
                          className="text-red-600 hover:text-red-800 hover:underline py-1 px-2 -mx-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeItem(item.product.id);
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="border-t border-gray-200 px-4 sm:px-6 py-4 sm:py-6">
            <div className="flex justify-between text-sm sm:text-base font-medium text-gray-900 mb-3 sm:mb-4">
              <p>Subtotal</p>
              <p>£{subtotal.toFixed(2)}</p>
            </div>
            <div className="flex justify-between text-sm sm:text-base font-medium text-gray-900 mb-3 sm:mb-4">
              <p>Shipping</p>
              <p>{shipping > 0 ? `£${shipping.toFixed(2)}` : 'Free'}</p>
            </div>
            <div className="flex justify-between text-base sm:text-lg font-bold text-gray-900 pt-3 sm:pt-4 border-t border-gray-200 mb-4 sm:mb-6">
              <p>Total</p>
              <p>£{total.toFixed(2)}</p>
            </div>
            
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end space-y-3 sm:space-y-0 space-x-0 sm:space-x-4">
              <button
                type="button"
                onClick={clearBasket}
                className="px-4 py-3 sm:py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 w-full sm:w-auto"
              >
                Clear Basket
              </button>
              <Link
                to="/checkout"
                className="flex justify-center items-center px-6 py-3 sm:py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 w-full sm:w-auto"
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