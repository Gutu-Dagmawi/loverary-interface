import React from 'react';
import { FaShoppingBag, FaArrowRight, FaTrash, FaSpinner, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router';
import { useState } from 'react';
import Nav from '../components/Nav';
import CartItem from '../components/CartItem';
import { useCart } from '../hooks/useCart';

export default function Cart() {
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState({
    success: null,
    message: ''
  });
  
  const { 
    cart, 
    updateItemQuantity, 
    removeFromCart, 
    clearCart,
    checkout: processCheckout
  } = useCart();

  const handleUpdateQuantity = (bookId, newQuantity) => {
    updateItemQuantity(bookId, newQuantity);
  };

  const handleRemoveItem = (bookId) => {
    removeFromCart(bookId);
  };

  const handleCheckout = async () => {
    if (cart.itemCount === 0) return;
    
    setIsCheckingOut(true);
    setCheckoutStatus({ success: null, message: '' });
    
    try {
      const result = await processCheckout();
      
      if (result.success) {
        setCheckoutStatus({
          success: true,
          message: 'Order placed successfully! Redirecting to orders...'
        });
        
        // Redirect to orders page after a short delay
        setTimeout(() => {
          navigate('/orders');
        }, 2000);
      } else {
        setCheckoutStatus({
          success: false,
          message: result.message || 'Failed to process your order. Please try again.'
        });
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setCheckoutStatus({
        success: false,
        message: 'An unexpected error occurred. Please try again.'
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleEmptyCart = async () => {
    if (window.confirm('Are you sure you want to remove all items from your cart?')) {
      try {
        await clearCart();
        // Optional: Show success message or update UI
      } catch (error) {
        console.error('Error emptying cart:', error);
        // Optional: Show error message to user
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Shopping Cart</h1>
          <span className="text-gray-600">
            {cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'}
          </span>
        </div>

        {cart.itemCount === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <div className="mx-auto w-24 h-24 text-gray-300 mb-4">
              <FaShoppingBag className="w-full h-full" />
            </div>
            <h2 className="text-2xl font-medium text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Looks like you haven't added any books yet.</p>
            <a
              href="/"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Continue Shopping
            </a>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Order Summary</h3>
            </div>
            
            <div className="divide-y divide-gray-200">
              {(cart.items || []).map(item => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemove={handleRemoveItem}
                />
              ))}
              {(cart.items || []).length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  Your cart is empty
                </div>
              )}
            </div>
            
            <div className="px-4 py-5 sm:px-6 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex space-x-4">
                  <button
                    onClick={handleEmptyCart}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <FaTrash className="mr-2" />
                    Empty Cart
                  </button>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    Subtotal ({cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'})
                  </p>
                  <p className="text-2xl font-bold text-gray-900">${cart.total.toFixed(2)}</p>
                  <div className="mt-4">
                    {checkoutStatus.message && (
                      <div className={`mb-3 p-3 rounded-md ${checkoutStatus.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                        <div className="flex items-center">
                          {checkoutStatus.success ? (
                            <FaCheckCircle className="mr-2 flex-shrink-0" />
                          ) : (
                            <FaExclamationCircle className="mr-2 flex-shrink-0" />
                          )}
                          <span className="text-sm">{checkoutStatus.message}</span>
                        </div>
                      </div>
                    )}
                    <button
                      onClick={handleCheckout}
                      disabled={isCheckingOut || cart.itemCount === 0}
                      className={`w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${
                        isCheckingOut || cart.itemCount === 0
                          ? 'bg-indigo-400 cursor-not-allowed'
                          : 'bg-indigo-600 hover:bg-indigo-700'
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                    >
                      {isCheckingOut ? (
                        <>
                          <FaSpinner className="animate-spin mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Proceed to Checkout
                          <FaArrowRight className="ml-2" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
