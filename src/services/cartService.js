import api, { fetchCSRFToken } from './api';

// Cache for the current cart
let currentCart = null;

/**
 * Clears the cart cache
 */
const clearCache = () => {
  currentCart = null;
};

/**
 * Fetches the current user's active cart
 * @returns {Promise<Object>} The current cart with items
 */
const getActiveCart = async () => {
  try {
    if (currentCart) {
      console.log('Returning cached cart:', currentCart);
      return currentCart;
    }

    console.log('Fetching active cart from API...');
    const response = await api.get('/carts/active');
    console.log('API Response:', response.data);
    
    if (response.data) {
      // Get the cart object from the response
      let cart = response.data.cart || response.data;
      
      // Map the items to the expected format
      if (cart.items && Array.isArray(cart.items)) {
        console.log('Found items in cart:', cart.items);
        // Convert items to cart_items format for backward compatibility
        cart.cart_items = cart.items.map(item => ({
          id: item.id,
          book_id: item.book_id,
          quantity: item.quantity,
          price: item.price,
          title: item.title,
          created_at: item.created_at,
          updated_at: item.updated_at
        }));
      } else {
        console.log('No items found in cart');
        cart.cart_items = [];
      }
      
      console.log('Returning cart with items:', cart);
      currentCart = cart;
      return cart;
    }
    
    // If no data in response
    throw new Error('No data in response');
    
  } catch (error) {
    // Handle 401 Unauthorized - clear auth token and redirect to login
    if (error.response && error.response.status === 401) {
      console.warn('User not authenticated, clearing auth data');
      // Clear any existing auth data
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      // Don't throw to prevent infinite loops, just return empty cart
      return { 
        cart_items: [],
        total: 0,
        subtotal: 0,
        tax: 0,
        shipping: 0
      };
    }
    
    // If no active cart exists (404) or server error (500), return an empty cart
    if (error.response && (error.response.status === 404 || error.response.status === 500)) {
      console.warn('No active cart found or server error, returning empty cart');
      return { 
        cart_items: [],
        total: 0,
        subtotal: 0,
        tax: 0,
        shipping: 0
      };
    }
    
    console.error('Error fetching active cart:', error);
    
    // For other errors, still return an empty cart but log the error
    return { 
      cart_items: [],
      total: 0,
      subtotal: 0,
      tax: 0,
      shipping: 0
    };
  }
};

/**
 * Get the current cart items
 * @returns {Promise<Array>} Array of cart items
 */
export const getCart = async () => {
  try {
    const cart = await getActiveCart();
    return cart.cart_items || [];
  } catch (error) {
    console.error('Error fetching cart items:', error);
    throw error;
  }
};

/**
 * Adds one or more items to the cart
 * @param {number|Object|Array} bookIdOrItems - Either a book ID, an item object, or an array of items
 * @param {number} [quantity=1] - Quantity to add (only used if first parameter is a book ID)
 * @returns {Promise<Object>} The updated cart
 * @throws {Error} If the request fails or items are invalid
 */
export const addToCart = async (bookIdOrItems, quantity = 1) => {
  let itemsToAdd = [];

  // Handle different parameter formats
  if (typeof bookIdOrItems === 'number' || typeof bookIdOrItems === 'string') {
    // Single book ID with optional quantity
    itemsToAdd = [{
      book_id: parseInt(bookIdOrItems, 10),
      quantity: parseInt(quantity, 10) || 1
    }];
  } else if (Array.isArray(bookIdOrItems)) {
    // Array of items
    itemsToAdd = bookIdOrItems.map(item => {
      if (typeof item === 'number' || typeof item === 'string') {
        return {
          book_id: parseInt(item, 10),
          quantity: 1
        };
      }
      return {
        book_id: parseInt(item.book_id || item.id, 10),
        quantity: parseInt(item.quantity, 10) || 1
      };
    });
  } else if (bookIdOrItems && typeof bookIdOrItems === 'object') {
    // Single item object
    itemsToAdd = [{
      book_id: parseInt(bookIdOrItems.book_id || bookIdOrItems.id, 10),
      quantity: parseInt(bookIdOrItems.quantity, 10) || 1
    }];
  }

  // Validate items
  if (itemsToAdd.length === 0) {
    throw new Error('At least one valid item with book_id and quantity is required');
  }

  const invalidItem = itemsToAdd.find(item => 
    isNaN(item.book_id) || item.book_id <= 0 || 
    isNaN(item.quantity) || item.quantity <= 0
  );

  if (invalidItem) {
    throw new Error('Each item must contain a valid book_id (number > 0) and quantity (number > 0)');
  }

  try {
    await fetchCSRFToken(); // Ensure we have a fresh CSRF token
    
    // Send items in the cart parameter as expected by the backend
    const response = await api.post('/carts/add', {
      cart: itemsToAdd
    });
    
    if (response.data && response.data.cart) {
      currentCart = response.data.cart;
    } else {
      throw new Error('Invalid response format from server');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error adding to cart:', {
      error: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    
    // Handle specific error cases
    if (error.response) {
      const { status, data } = error.response;
      
      if (status === 400) {
        throw new Error(data.error || 'Invalid request. Please check the item details.');
      } else if (status === 401) {
        throw new Error('Please log in to add items to your cart');
      } else if (status === 404) {
        throw new Error('One or more books could not be found');
      } else if (status === 406) {
        throw new Error('No valid items in request');
      } else if (status === 409) {
        throw new Error('Insufficient stock for one or more items');
      } else if (status === 422) {
        const errorMsg = data?.errors?.items?.join('\n') || 'Invalid item data';
        throw new Error(errorMsg);
      } else if (status >= 500) {
        throw new Error('Server error. Please try again later.');
      }
    }
    
    throw error;
  }
};

/**
 * Updates the quantity of an item in the cart
 * @param {number} bookId - The ID of the book to update
 * @param {number} quantity - The new quantity (0 to remove)
 * @returns {Promise<Object>} The updated cart
 */
export const updateCartItem = async (bookId, quantity) => {
  try {
    await fetchCSRFToken();
    
    // Send parameters as URL-encoded form data to match Rails' expected format
    const params = new URLSearchParams();
    params.append('book_id', bookId);
    params.append('quantity', quantity);
    
    const response = await api.patch('/carts', params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    if (response.data && response.data.cart) {
      currentCart = response.data.cart;
    }
    
    return response.data;
  } catch (error) {
    console.error('Error updating cart item:', error);
    
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Item not found in cart');
      } else if (error.response.status === 422) {
        const errorMsg = error.response.data?.errors?.quantity?.[0] || 'Invalid quantity';
        throw new Error(errorMsg);
      }
    }
    
    throw error;
  }
};

/**
 * Removes an item from the cart
 * @param {number} bookId - The ID of the book to remove
 * @returns {Promise<Object>} The updated cart
 */
export const removeFromCart = async (bookId) => {
  try {
    await fetchCSRFToken();
    
    // Use the correct endpoint format: /carts/remove/:book_id
    const response = await api.delete(`/carts/remove/${bookId}`);
    
    if (response.data && response.data.cart) {
      currentCart = response.data.cart;
    }
    
    return response.data;
  } catch (error) {
    console.error('Error removing item from cart:', error);
    
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Item not found in cart');
      } else if (error.response.status === 401) {
        throw new Error('Please log in to modify your cart');
      }
    }
    
    throw error;
  }
};

/**
 * Clears all items from the cart
 * @returns {Promise<Object>} The empty cart
 */
export const clearCart = async () => {
  try {
    await fetchCSRFToken();
    
    const response = await api.delete('/carts/clear');
    
    if (response.data && response.data.cart) {
      currentCart = response.data.cart;
    }
    
    return response.data;
  } catch (error) {
    console.error('Error clearing cart:', error);
    
    if (error.response) {
      if (error.response.status === 401) {
        throw new Error('Please log in to modify your cart');
      }
    }
    
    throw error;
  }
};

/**
 * Initiates the checkout process
 * @returns {Promise<Object>} The order details
 */
export const checkout = async () => {
  try {
    await fetchCSRFToken();
    
    // First, complete the checkout
    const checkoutResponse = await api.post('/carts/checkout', {});
    
    // Then, fetch the updated orders list using the correct endpoint
    const ordersResponse = await api.get('/users/orders');
    
    // Clear the cart cache after successful checkout
    if (checkoutResponse.data && checkoutResponse.data.order) {
      currentCart = { cart_items: [] };
    }
    
    // Return both the checkout and orders data
    return {
      ...checkoutResponse.data,
      orders: ordersResponse.data.orders || []
    };
  } catch (error) {
    console.error('Error during checkout:', error);
    
    if (error.response) {
      if (error.response.status === 401) {
        throw new Error('Please log in to complete your purchase');
      } else if (error.response.status === 400) {
        throw new Error(error.response.data.message || 'Unable to process checkout');
      } else if (error.response.status === 422) {
        const errorMsg = error.response.data?.errors?.join(' ') || 'Invalid cart data';
        throw new Error(errorMsg);
      }
    }
    
    throw error;
  }
};

// All functions are exported inline above

// Also provide a default export for backward compatibility
const cartService = {
  getCart,
  getActiveCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  checkout,
  clearCache
};

export default cartService;
