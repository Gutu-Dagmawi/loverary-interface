import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { FaShoppingBag, FaArrowLeft, FaExclamationTriangle } from 'react-icons/fa';
import Nav from '../components/Nav';
import OrderItem from '../components/OrderItem';
import { getOrders } from '../services/orderService';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const orders = await getOrders();
        
        // Format the orders to match the expected structure
        const formattedOrders = orders.map(order => ({
          ...order,
          // Convert status number to string for the UI
          status: getStatusText(order.status),
          // Ensure order_items is an array
          order_items: order.order_items || []
        }));
        
        setOrders(formattedOrders);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);
  
  // Helper function to convert status number to text
  const getStatusText = (statusCode) => {
    const statusMap = {
      0: 'pending',
      1: 'processing',
      2: 'completed',
      3: 'cancelled'
    };
    return statusMap[statusCode] || 'pending';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Nav />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">My Orders</h1>
          </div>
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Nav />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">My Orders</h1>
          </div>
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center">
            <div className="text-red-500 mb-4">
              <svg
                className="mx-auto h-12 w-12 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading orders</h3>
            <p className="text-gray-500 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-7xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 px-2 sm:px-0">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Orders</h1>
            <p className="mt-1 text-sm text-gray-500">
              View your order history and track shipments
            </p>
          </div>
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            <FaArrowLeft className="mr-2 h-4 w-4" />
            <span>Back to Shop</span>
          </Link>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {orders.length === 0 ? (
            <div className="text-center p-8 sm:p-12">
              <div className="mx-auto flex items-center justify-center h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-indigo-50 text-indigo-400 mb-4">
                <FaShoppingBag className="h-10 w-10" />
              </div>
              <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                You haven't placed any orders yet. Start shopping to see your orders here!
              </p>
              <Link
                to="/"
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm sm:text-base font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              <div className="px-4 py-4 sm:px-6 bg-gray-50 border-b border-gray-200">
                <div className="flex flex-wrap items-center justify-between">
                  <h2 className="text-base sm:text-lg font-medium text-gray-900">
                    Order History
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-0">
                    {orders.length} {orders.length === 1 ? 'order' : 'orders'} in total
                  </p>
                </div>
              </div>
              
              <div className="space-y-6 py-2">
                {orders.map((order) => (
                  <div key={order.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <OrderItem order={order} />
                  </div>
                ))}
              </div>
              
              <div className="px-4 py-4 sm:px-6 bg-gray-50 text-right">
                <Link
                  to="/"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Continue Shopping <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
