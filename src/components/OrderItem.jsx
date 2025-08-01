import React from 'react';
import { Link } from 'react-router';
import { FaBookOpen } from 'react-icons/fa';

export default function OrderItem({ order }) {
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { bg: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      processing: { bg: 'bg-blue-100 text-blue-800', text: 'Processing' },
      completed: { bg: 'bg-green-100 text-green-800', text: 'Completed' },
      cancelled: { bg: 'bg-red-100 text-red-800', text: 'Cancelled' },
    };

    const statusInfo = statusMap[status] || { bg: 'bg-gray-100 text-gray-800', text: status };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.text}`}>
        {statusInfo.text}
      </span>
    );
  };

  return (
    <div className="bg-white shadow overflow-hidden rounded-lg mb-6 transition-all duration-200 hover:shadow-md">
      <div className="px-4 py-4 sm:px-6 border-b border-gray-200">
        <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:justify-between sm:items-start">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-medium text-gray-900 truncate">
                Order #{order.id}
              </h3>
              <span className="sm:hidden">
                {getStatusBadge(order.status || 'pending')}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              <span className="hidden sm:inline">Placed on </span>
              {formatDate(order.created_at || new Date().toISOString())}
            </p>
          </div>
          <div className="hidden sm:block">
            {getStatusBadge(order.status || 'pending')}
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 px-4 py-4 sm:py-5 grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 sm:px-6">
        <div className="col-span-1">
          <dt className="text-xs sm:text-sm font-medium text-gray-500">Order Total</dt>
          <dd className="mt-1 text-sm sm:text-base font-semibold text-gray-900">
            ${parseFloat(order.total_price || 0).toFixed(2)}
          </dd>
        </div>
        <div className="col-span-1">
          <dt className="text-xs sm:text-sm font-medium text-gray-500">Items</dt>
          <dd className="mt-1 text-sm sm:text-base text-gray-900">
            {order.order_items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0} items
          </dd>
        </div>
        <div className="col-span-2 sm:col-span-1 text-right sm:text-left">
          <dt className="text-xs sm:text-sm font-medium text-gray-500">Order Date</dt>
          <dd className="mt-1 text-sm sm:text-base text-gray-900">
            {new Date(order.created_at || new Date().toISOString()).toLocaleDateString()}
          </dd>
        </div>
      </div>
      
      <div className="px-4 py-4 sm:px-6">
        <h4 className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Order Items</h4>
        <ul className="divide-y divide-gray-200">
          {order.order_items?.map((item) => (
            <li key={item.id} className="py-4">
              <div className="flex flex-col sm:flex-row sm:items-start">
                <div className="flex-shrink-0 w-full sm:w-20 h-32 sm:h-20 bg-gray-100 rounded-md overflow-hidden mb-3 sm:mb-0 sm:mr-4">
                  {item.book?.cover_url ? (
                    <img
                      src={item.book.cover_url}
                      alt={item.book.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-50 text-gray-300">
                      <FaBookOpen className="h-6 w-6" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                    <div className="flex-1 min-w-0 pr-2">
                      <h3 className="text-sm sm:text-base font-medium text-gray-900 truncate">
                        <Link 
                          to={`/books/${item.book_id}`} 
                          className="hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded"
                        >
                          {item.book?.title || 'Unknown Book'}
                        </Link>
                      </h3>
                      {item.book?.author && (
                        <p className="mt-1 text-xs sm:text-sm text-gray-500 truncate">
                          by {item.book.author}
                        </p>
                      )}
                    </div>
                    <div className="mt-2 sm:mt-0 text-right sm:text-left">
                      <p className="text-sm sm:text-base font-medium text-gray-900">
                        ${parseFloat(item.price || 0).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-between items-center">
                    <p className="text-xs sm:text-sm text-gray-500">
                      Item #{item.book_id}
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      ${parseFloat((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
