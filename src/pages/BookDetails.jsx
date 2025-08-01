import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import Nav from '../components/Nav';
import { getBookById } from '../services/bookService';
import { Button, Snackbar, Alert } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useCart } from '../hooks/useCart';

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Books", to: "/books" },
  { label: "Orders", to: "/orders" },
  { label: "Profile", to: "/profile" },
];

export default function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const data = await getBookById(id);
        setBook(data);
      } catch (err) {
        setError(err.message);
        console.error('Failed to fetch book:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  const handleAddToCart = async () => {
    try {
      await addToCart(book.id, 1); // Pass book ID and quantity
      showSnackbar(`${book.title} added to cart!`, 'success');
    } catch (error) {
      console.error('Error adding to cart:', error);
      showSnackbar(error.message || 'Failed to add item to cart', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleAddToWishlist = () => {
    // TODO: Implement add to wishlist functionality
    console.log('Adding to wishlist:', book.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Nav links={navLinks} />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading book details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Nav links={navLinks} />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            <p>Error loading book: {error}</p>
            <button 
              onClick={() => navigate(-1)}
              className="mt-2 text-blue-600 hover:underline"
            >
              &larr; Go back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Nav links={navLinks} />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Book not found</h2>
            <button 
              onClick={() => navigate('/')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Browse Books
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav links={navLinks} />
      <div className="container mx-auto px-4 py-4 md:py-8 max-w-7xl">
        <button 
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900"
        >
          <span className="mr-1">←</span> Back to results
        </button>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Book Cover */}
            <div className="w-full md:w-1/3 p-4 md:p-6 flex justify-center bg-gray-100">
              <img 
                src={book.cover_url} 
                alt={`${book.title} cover`} 
                className="h-auto max-h-[500px] w-auto max-w-full object-contain rounded shadow-md"
                style={{ maxHeight: '80vh' }}
              />
            </div>
            
            {/* Book Details */}
            <div className="w-full md:w-2/3 p-4 md:p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
              <p className="text-xl text-gray-600 mb-4">by {book.author_name || 'Unknown Author'}</p>
              
              <div className="mb-6">
                <p className="text-sm text-gray-500">Edition: {book.edition || 'N/A'}</p>
                <p className="text-sm text-gray-500">In Stock: {book.stock || 0} available</p>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Summary</h3>
                <p className="text-gray-700 leading-relaxed">
                  {book.summary || 'No summary available.'}
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">ISBN</p>
                  <p className="font-medium">{book.isbn || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Edition</p>
                  <p className="font-medium">{book.edition || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pages</p>
                  <p className="font-medium">{book.page_count || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Language</p>
                  <p className="font-medium">{book.language || 'N/A'}</p>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">
                    ${book.price ? parseFloat(book.price).toFixed(2) : 'N/A'}
                  </span>
                    {book.originalPrice && (
                      <span className="ml-2 text-sm text-gray-500 line-through">
                        ${parseFloat(book.originalPrice).toFixed(2)}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                    <Button
                      variant="outlined"
                      startIcon={<FavoriteBorderIcon />}
                      onClick={handleAddToWishlist}
                      className="text-gray-700 border-gray-300 hover:bg-gray-50 w-full sm:w-auto"
                      fullWidth
                    >
                      <span className="hidden sm:inline">Wishlist</span>
                      <span className="sm:hidden">Add to Wishlist</span>
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<ShoppingCartIcon />}
                      onClick={handleAddToCart}
                      className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                      fullWidth
                    >
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Additional sections can be added here */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">You may also like</h2>
          <div className="text-center py-8 text-gray-500">
            <p>Related books will be displayed here</p>
          </div>
        </div>
      </div>
      
      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={3000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}
