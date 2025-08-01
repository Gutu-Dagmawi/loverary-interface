import React from 'react';
import { FaTrash, FaPlus, FaMinus } from 'react-icons/fa';

export default function CartItem({ item, onUpdateQuantity, onRemove }) {
  const { book = {}, quantity = 0 } = item || {};
  const price = parseFloat(book?.price) || 0;
  const totalPrice = (price * quantity).toFixed(2);

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-100 mb-4">
      <div className="flex items-center space-x-4">
        <img 
          src={book?.cover_url || 'https://via.placeholder.com/80x120?text=No+Cover'} 
          alt={book?.title || 'Book cover'}
          className="w-20 h-24 object-cover rounded"
        />
        <div>
          <h3 className="font-medium text-gray-900">{book?.title || 'Unknown Book'}</h3>
          <p className="text-sm text-gray-500">by {book?.author?.name || 'Unknown Author'}</p>
          <p className="text-indigo-600 font-medium mt-1">${price.toFixed(2)}</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => onUpdateQuantity(book?.id, Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
            className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaMinus size={12} />
          </button>
          <span className="w-8 text-center">{quantity}</span>
          <button 
            onClick={() => onUpdateQuantity(book?.id, quantity + 1)}
            className="px-3 py-1 text-gray-600 hover:bg-gray-100"
          >
            <FaPlus size={12} />
          </button>
        </div>
        
        <div className="text-right">
          <p className="text-lg font-semibold">${totalPrice}</p>
          <button 
            onClick={() => onRemove(book?.id)}
            className="text-red-500 hover:text-red-700 text-sm flex items-center justify-end mt-1"
          >
            <FaTrash className="mr-1" size={12} /> Remove
          </button>
        </div>
      </div>
    </div>
  );
}
