import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../contexts/useAuth';
import Nav from '../components/Nav';

export default function Checkout() {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });

  useEffect(() => {
    if (cart.items.length === 0) {
      navigate('/cart');
    }
  }, [cart.items.length, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      const orderData = {
        user_id: user?.id,
        status: 1,
        total_price: cart.total,
        items: cart.items.map(item => ({
          book_id: item.book.id,
          quantity: item.quantity,
          price: item.book.price
        })),
        shipping: {
          address: formData.address,
          status: 1,
          tracking_code: `TRK-${Date.now()}`
        }
      };

      console.log('Order data:', orderData);
      clearCart();
      navigate('/order-confirmation', { 
        state: { 
          orderNumber: `ORD-${Date.now()}`,
          email: formData.email
        } 
      });
      
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Error processing your order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Nav />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <button
            onClick={() => navigate('/books')}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 lg:pb-0">
      <Nav />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-6 sm:pt-6 sm:pb-8 max-w-7xl">
        <div className="mb-6 sm:mb-8 text-center px-2 sm:px-0">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-2">Complete Your Purchase</h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">Enter your details to complete your order</p>
        </div>
        
        {/* Mobile Order Summary Toggle - Only shows on mobile/tablet */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 p-3 z-10">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-gray-700">Order Total</p>
              <p className="text-2xl font-bold text-indigo-600">${cart.total.toFixed(2)}</p>
            </div>
            <button 
              onClick={() => document.getElementById('order-summary').scrollIntoView({ behavior: 'smooth' })}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              View Order
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              {/* Shipping Info */}
              <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-100">
                  <div className="bg-blue-50 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1h.05a2.5 2.5 0 014.9 0H19a1 1 0 001-1v-2h1a1 1 0 00.894-1.447l-3-6A1 1 0 0017 3H5.28l-.5-1.5A1 1 0 003.8 1H2a1 1 0 00-1 1v1.5a.5.5 0 00.5.5h1a.5.5 0 00.5-.5V4z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-medium text-gray-800">Shipping Information</h2>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-1">First Name</label>
                    <input 
                      type="text" 
                      name="firstName" 
                      value={formData.firstName} 
                      onChange={handleChange} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Last Name</label>
                    <input 
                      type="text" 
                      name="lastName" 
                      value={formData.lastName} 
                      onChange={handleChange} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required 
                    />
                  </div>
                </div>
                
                <div className="mb-4 sm:mb-6">
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required 
                  />
                </div>
                
                <div className="mb-4 sm:mb-6">
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <input 
                    type="text" 
                    name="address" 
                    value={formData.address} 
                    onChange={handleChange} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required 
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-1">City</label>
                    <input 
                      type="text" 
                      name="city" 
                      value={formData.city} 
                      onChange={handleChange} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Postal Code</label>
                    <input 
                      type="text" 
                      name="postalCode" 
                      value={formData.postalCode} 
                      onChange={handleChange} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required 
                    />
                  </div>
                </div>
              </div>
              
              {/* Payment Info */}
              <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-100">
                  <div className="bg-blue-50 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                      <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-medium text-gray-800">Payment Details</h2>
                </div>
                
                <div className="mb-4 sm:mb-6">
                  <label className="block text-sm font-medium mb-1">Card Number</label>
                  <input 
                    type="text" 
                    name="cardNumber" 
                    value={formData.cardNumber} 
                    onChange={handleChange} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1234 5678 9012 3456"
                    required 
                  />
                </div>
                
                <div className="mb-4 sm:mb-6">
                  <label className="block text-sm font-medium mb-1">Name on Card</label>
                  <input 
                    type="text" 
                    name="cardName" 
                    value={formData.cardName} 
                    onChange={handleChange} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="John Doe"
                    required 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-1">Expiry Date</label>
                    <input 
                      type="text" 
                      name="expiryDate" 
                      placeholder="MM/YY" 
                      value={formData.expiryDate} 
                      onChange={handleChange} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">CVV</label>
                    <input 
                      type="text" 
                      name="cvv" 
                      value={formData.cvv} 
                      onChange={handleChange} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="123"
                      required 
                    />
                  </div>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-indigo-600 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg font-medium text-base sm:text-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Place Order'
                )}
              </button>
            </form>
          </div>
          
          {/* Order Summary */}
          <div id="order-summary" className="lg:sticky lg:top-24 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden h-fit">
            <div className="p-5 sm:p-6 md:p-7">
              <h2 className="text-xl font-medium text-gray-800 mb-5 pb-3 border-b-2 border-indigo-100">Order Summary</h2>
              
              <div className="space-y-5 mb-6">
                {cart.items.map(item => (
                  <div key={item.book.id} className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-20 bg-indigo-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                        {item.book.cover_url && (
                          <img 
                            src={item.book.cover_url} 
                            alt={item.book.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{item.book.title}</h3>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-medium text-gray-900">${(item.book.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              
              <div className="space-y-4 pt-6 border-t-2 border-indigo-50">
                <div className="flex justify-between">
                  <span className="text-gray-700 font-medium">Subtotal</span>
                  <span className="font-semibold text-gray-900">${cart.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 font-medium">Shipping</span>
                  <span className="text-green-600 font-semibold">Free Shipping</span>
                </div>
              </div>
            </div>
            <div className="p-5 bg-gray-50 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-800">Total</span>
                <span className="text-2xl font-bold text-indigo-600">${cart.total.toFixed(2)}</span>
              </div>
              <button 
                type="button"
                onClick={() => document.getElementById('checkout-form').scrollIntoView({ behavior: 'smooth' })}
                className="mt-4 w-full bg-indigo-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Continue to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
