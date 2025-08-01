import api from './api';

/**
 * Fetches the current user's cart
 * @returns {Promise<Array>} Array of cart items
 */
// Get the current user's active cart
const getActiveCart = async () => {
  try {
    // In a real app, we'd filter by the current user's ID
    const response = await api.get('/carts?status=1&_embed=cart_items');
    
    // If we have an active cart, return it with items
    if (response.data && response.data.length > 0) {
      const cart = response.data[0];
      // Ensure cart_items is always an array
      if (!cart.cart_items) {
        cart.cart_items = [];
      } else if (!Array.isArray(cart.cart_items)) {
        // Handle case where cart_items is not an array
        cart.cart_items = [];
      }
      return cart;
    }
    
    // If no active cart exists, create one for the user
    try {
      const newCart = await api.post('/carts', {
        user_id: 1, // In a real app, this would be the current user's ID
        status: 1, // 1 = active, 2 = completed, etc.
        total_price: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      // Ensure we always return a cart with items array
      return { 
        ...newCart.data, 
        cart_items: [],
        total_price: 0
      };
      
    } catch (createError) {
      console.error('Error creating new cart:', createError);
      // Return a fallback cart object if creation fails
      return {
        id: 'fallback-cart',
        user_id: 1,
        status: 1,
        total_price: 0,
        cart_items: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
    
  } catch (error) {
    console.error('Error in getActiveCart:', error);
    // Return a fallback cart object if there's an error
    return {
      id: 'error-cart',
      user_id: 1,
      status: 1,
      total_price: 0,
      cart_items: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }
};

export const getCart = async () => {
  try {
    const cart = await getActiveCart();
    return cart.cart_items || [];
  } catch (error) {
    console.error('Error fetching cart items:', error);
    return [];
  }
};

/**
 * Adds an item to the cart
 * @param {number} bookId - The ID of the book to add
 * @param {number} quantity - The quantity to add
 * @returns {Promise<Object>} The updated cart item
 */
export const addToCart = async (bookId, quantity = 1) => {
  try {
    // Get the active cart
    const cart = await getActiveCart();
    
    // Check if the item already exists in the cart
    const existingItem = cart.cart_items?.find(item => item.book_id == bookId);
    
    if (existingItem) {
      // Update quantity if item exists
      return await updateCartItem(existingItem.id, existingItem.quantity + quantity);
    } else {
      // Add new item to cart
      const response = await api.post('/cart_items', {
        cart_id: cart.id,
        book_id: bookId,
        quantity: quantity,
        price: 0, // Will be updated by the server
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      // Update cart total
      await updateCartTotal(cart.id);
      
      return response.data;
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

// Helper function to update cart total
const updateCartTotal = async (cartId) => {
  if (!cartId) {
    console.error('No cartId provided to updateCartTotal');
    return 0;
  }
  
  try {
    console.log(`Updating cart total for cart ID: ${cartId} (type: ${typeof cartId})`);
    
    // First, get all cart items
    const response = await api.get('/cart_items');
    console.log('Cart items response:', response.status, response.data);
    
    // Filter items for the current cart on the client side
    const items = Array.isArray(response.data) 
      ? response.data.filter(item => {
          const cartMatch = parseInt(item.cart_id) === parseInt(cartId);
          if (!cartMatch) {
            console.log(`Skipping item ${item.id} - cart_id: ${item.cart_id} (type: ${typeof item.cart_id})`);
          }
          return cartMatch;
        })
      : [];
    
    console.log(`Found ${items.length} items for cart ${cartId}`);
    
    // Calculate the new total
    const total = items.reduce((sum, item) => {
      const itemTotal = parseFloat(item.price) * parseInt(item.quantity);
      console.log(`Item ${item.id}: ${item.quantity} x ${item.price} = ${itemTotal}`);
      return sum + itemTotal;
    }, 0);
    
    console.log(`Calculated total: ${total}`);
    
    // Update the cart's total_price
    const updateData = {
      total_price: parseFloat(total.toFixed(2)),
      updated_at: new Date().toISOString()
    };
    
    console.log('Updating cart with data:', updateData);
    
    try {
      const updateResponse = await api.patch(`/carts/${cartId}`, updateData);
      console.log('Cart update successful:', updateResponse.status, updateResponse.data);
      return total;
    } catch (updateError) {
      console.error('Failed to update cart:', updateError);
      if (updateError.response) {
        console.error('Response data:', updateError.response.data);
        console.error('Response status:', updateError.response.status);
        console.error('Response headers:', updateError.response.headers);
      }
      throw updateError;
    }
  } catch (error) {
    console.error('Error updating cart total:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    }
    // Re-throw the error to be handled by the caller
    throw error;
  }
};

/**
 * Updates the quantity of a cart item
 * @param {number} bookId - The ID of the book to update
 * @param {number} quantity - The new quantity
 * @returns {Promise<Object>} The updated cart item
 */
export const updateCartItem = async (itemId, quantity) => {
  try {
    const updatedQuantity = Math.max(1, Math.min(quantity, 100));
    
    // Get the current item to update
    const itemResponse = await api.get(`/cart_items/${itemId}`);
    const item = itemResponse.data;
    
    const response = await api.patch(`/cart_items/${itemId}`, {
      quantity: updatedQuantity,
      updated_at: new Date().toISOString()
    });
    
    // Update cart total
    await updateCartTotal(item.cart_id);
    
    return response.data;
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw error;
  }
};

/**
 * Removes an item from the cart
 * @param {number} bookId - The ID of the book to remove
 * @returns {Promise<void>}
 */
export const removeFromCart = async (itemId) => {
  try {
    // Get the item first to get the cart ID
    const itemResponse = await api.get(`/cart_items/${itemId}`);
    const item = itemResponse.data;
    
    // Delete the item
    await api.delete(`/cart_items/${itemId}`);
    
    // Update cart total
    if (item && item.cart_id) {
      await updateCartTotal(item.cart_id);
    }
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
};

/**
 * Clears the entire cart
 * @returns {Promise<void>}
 */
export const clearCart = async () => {
  try {
    const cart = await getActiveCart();
    const cartId = cart.id;
    
    // Get all items in the cart
    const itemsResponse = await api.get(`/cart_items?cart_id=${cartId}`);
    const items = itemsResponse.data || [];
    
    // Delete all items
    await Promise.all(
      items.map(item => api.delete(`/cart_items/${item.id}`))
    );
    
    // Update cart total to zero
    await api.patch(`/carts/${cartId}`, {
      total_price: '0.00',
      updated_at: new Date().toISOString()
    });
    
    return [];
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};

export default {
  getCart,
  getActiveCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  updateCartTotal
};
