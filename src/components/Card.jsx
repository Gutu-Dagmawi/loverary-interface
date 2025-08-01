import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router';
import { Button } from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { green } from '@mui/material/colors';

const Card = ({ 
  title, 
  author, 
  imageUrl,
  price = 'N/A',
  className = '',
  to = '#',
  onAddToCart = () => {}
}) => {
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    // Simulate API call
    setTimeout(() => {
      onAddToCart();
      setIsAdding(false);
    }, 500);
  };

  return (
    <NavLink className={`group flex flex-col h-full rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-gray-300 ${className}`} to={to}>
      {/* Book Cover */}
      <div className="bg-gray-50 overflow-hidden h-[200px] sm:h-[240px] md:h-[280px] flex items-center justify-center p-2">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={`Cover of ${title}`}
            className="object-contain w-full h-full transition-transform duration-200 group-hover:scale-105"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/100x150?text=No+Cover';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        )}
      </div>

      {/* Book Info */}
      <div className="p-3 flex-grow flex flex-col">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight mb-1 min-h-[2.5em]" title={title}>
          {title}
        </h3>
        <p className="text-xs text-gray-500 mb-2 line-clamp-1">{author}</p>

        {/* Price and Actions */}
        <div className="mt-auto pt-2 border-t border-gray-100">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm sm:text-base font-bold text-gray-900 whitespace-nowrap">
              {typeof price === 'number' ? `₾${price.toFixed(2)}` : price}
            </p>
            <Button
              variant="contained"
              size="small"
              onClick={handleAddToCart}
              disabled={isAdding}
              sx={{
                minWidth: '32px',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'white',
                color: green[600],
                border: `1px solid ${green[600]}`,
                '&:hover': {
                  backgroundColor: green[50],
                },
                '&.Mui-disabled': {
                  backgroundColor: green[50],
                  color: green[200],
                  borderColor: green[200],
                },
                padding: 0,
              }}
            >
              {isAdding ? (
                <div className="w-4 h-4 border-2 border-t-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <AddShoppingCartIcon fontSize="small" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </NavLink>
  );
};

Card.propTypes = {
  title: PropTypes.string.isRequired,
  author: PropTypes.string.isRequired,
  price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  imageUrl: PropTypes.string,
  buttonText: PropTypes.string,
  className: PropTypes.string,
  to: PropTypes.string,
  showButton: PropTypes.bool,
  onAddToCart: PropTypes.func,
};

export default Card;
