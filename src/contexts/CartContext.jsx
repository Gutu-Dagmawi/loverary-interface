import React, { createContext, useState, useEffect } from 'react';
import cartService from '../services/cartService';
import api from '../services/api';

const CartContext = createContext();

// Default cart structure
const defaultCart = {
  items: [],
  total: 0,
  itemCount: 0
};

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ ...defaultCart });
  const [isLoading, setIsLoading] = useState(true);

  // Initialize cart from API
  const initializeCart = async () => {
    try {
      const cartData = await cartService.getActiveCart();
      console.log('Cart data from API:', cartData);
      
      // Use cart_items if available, otherwise fall back to items or empty array
      const cartItems = cartData.cart_items || cartData.items || [];
      console.log('Cart items:', cartItems);
      
      // Process cart items to ensure they have the required structure
      const processedItems = await Promise.all(
        cartItems.map(async (item) => {
          try {
            // If the item already has book details, use them
            if (item.title && item.price) {
              return {
                ...item,
                book_id: item.book_id || item.id,
                book: {
                  id: item.book_id || item.id,
                  title: item.title,
                  price: parseFloat(item.price) || 0,
                  cover_url: item.cover_url || ''
                }
              };
            }
            
            // Otherwise, fetch book details
            const bookId = item.book_id || item.id;
            if (bookId) {
              const bookResponse = await api.get(`/books/${bookId}`);
              return {
                ...item,
                book_id: bookId,
                book: bookResponse.data || { id: bookId, title: 'Unknown Book', price: 0 }
              };
            }
            
            return item;
          } catch (err) {
            console.error(`Failed to process cart item:`, item, err);
            return {
              ...item,
              book_id: item.book_id || item.id,
              book: { id: item.book_id || item.id, title: 'Unknown Book', price: 0 }
            };
          }
        })
      );

      console.log('Processed cart items:', processedItems);
      
      const itemCount = processedItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
      const total = parseFloat(processedItems.reduce(
        (sum, item) => sum + ((item.book?.price || 0) * (item.quantity || 0)),
        0
      ).toFixed(2));
      
      console.log('Setting cart state:', { items: processedItems, itemCount, total });
      
      setCart({
        items: processedItems,
        itemCount,
        total
      });
    } catch (error) {
      console.error('Failed to fetch cart', error);
      // Fallback to empty cart
      setCart({ ...defaultCart });
    } finally {
      setIsLoading(false);
    }
  };

  // Load cart on mount and when auth state changes
  useEffect(() => {
    // Only try to load cart if user is authenticated
    const token = localStorage.getItem('authToken');
    if (token) {
      initializeCart();
    } else {
      // If not authenticated, ensure cart is empty
      setCart({ ...defaultCart });
      setIsLoading(false);
    }
  }, []);

  const updateCart = (newCart) => {
    const updatedCart = {
      items: newCart.items || [],
      itemCount: (newCart.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0),
      total: parseFloat((newCart.items || []).reduce(
        (sum, item) => sum + ((item.book?.price || 0) * (item.quantity || 0)),
        0
      ).toFixed(2))
    };
    
    setCart(updatedCart);
  };

  const addToCart = async (book, quantity = 1) => {
    try {
      // Pass book and quantity as an object to match the service's expected format
      const response = await cartService.addToCart({
        book_id: book.id,
        quantity: quantity
      });
      
      // The backend returns the updated cart in response.cart or response.data
      const updatedCart = response.cart || response.data || {};
      const cartItems = updatedCart.cart_items || updatedCart.items || [];
      
      // Process the cart items to ensure they have the required structure
      const processedItems = await Promise.all(
        cartItems.map(async (item) => {
          try {
            // If the item already has book details, use them
            if (item.title && item.price) {
              return {
                ...item,
                book_id: item.book_id || item.id,
                book: {
                  id: item.book_id || item.id,
                  title: item.title,
                  price: parseFloat(item.price) || 0,
                  cover_url: item.cover_url || ''
                },
                quantity: item.quantity || 1
              };
            }
            
            // Otherwise, fetch book details
            const bookId = item.book_id || item.id;
            if (bookId) {
              const bookResponse = await api.get(`/books/${bookId}`);
              return {
                ...item,
                book_id: bookId,
                book: bookResponse.data || { id: bookId, title: 'Unknown Book', price: 0 },
                quantity: item.quantity || 1
              };
            }
            
            return item;
          } catch (err) {
            console.error(`Failed to process cart item:`, item, err);
            return {
              ...item,
              book_id: item.book_id || item.id,
              book: { id: item.book_id || item.id, title: 'Unknown Book', price: 0 },
              quantity: item.quantity || 1
            };
          }
        })
      );
      
      const itemCount = processedItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
      const total = parseFloat(processedItems.reduce(
        (sum, item) => sum + ((item.book?.price || 0) * (item.quantity || 0)),
        0
      ).toFixed(2));
      
      // Update the cart state with the processed items
      const newCartState = {
        items: processedItems,
        itemCount,
        total
      };
      
      // Clear the current cart cache to force a refresh
      cartService.clearCache();
      setCart(newCartState);
      return newCartState;
    } catch (error) {
      console.error('Failed to add item to cart', error);
      throw error;
    }
  };

  const removeFromCart = async (bookId) => {
    try {
      await cartService.removeFromCart(bookId);
      
      // Update local state
      setCart(prevCart => {
        const updatedItems = (prevCart.items || []).filter(item => item.book?.id !== bookId);
        const updatedCart = {
          items: updatedItems,
          itemCount: updatedItems.reduce((sum, item) => sum + (item.quantity || 0), 0),
          total: parseFloat(updatedItems.reduce(
            (sum, item) => sum + ((item.book?.price || 0) * (item.quantity || 0)), 
            0
          ).toFixed(2))
        };
        return updatedCart;
      });
    } catch (error) {
      console.error('Failed to remove item from cart', error);
      throw error;
    }
  };

  const updateItemQuantity = async (bookId, quantity) => {
    try {
      const newQuantity = Math.max(1, Math.min(quantity, 100));
      await cartService.updateCartItem(bookId, newQuantity);
      
      // Update local state
      setCart(prevCart => {
        const updatedItems = (prevCart.items || []).map(item => 
          item.book?.id === bookId ? { ...item, quantity: newQuantity } : item
        );
        const updatedCart = {
          items: updatedItems,
          itemCount: updatedItems.reduce((sum, item) => sum + (item.quantity || 0), 0),
          total: parseFloat(updatedItems.reduce(
            (sum, item) => sum + ((item.book?.price || 0) * (item.quantity || 0)), 
            0
          ).toFixed(2))
        };
        return updatedCart;
      });
    } catch (error) {
      console.error('Failed to update item quantity', error);
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      await cartService.clearCart();
      
      // Update local state
      const updatedCart = {
        items: [],
        total: 0,
        itemCount: 0
      };
      setCart(updatedCart);
    } catch (error) {
      console.error('Failed to clear cart', error);
      throw error;
    }
  };

  const checkout = async () => {
    try {
      if (!cart.items || cart.items.length === 0) {
        throw new Error('Cannot checkout with an empty cart');
      }

      // Use cartService to process the checkout
      const result = await cartService.checkout();
      
      // Clear the cart after successful checkout
      await clearCart();
      
      // Return success status and order details
      return { 
        success: true, 
        message: 'Order placed successfully!',
        order: result.order
      };
    } catch (error) {
      console.error('Checkout failed:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to process checkout. Please try again.'
      };
    }
  };

  // Only render children when cart is loaded
  if (isLoading) {
    return <div>Loading cart...</div>;
  }

  return (
    <CartContext.Provider 
      value={{ 
        cart, 
        addToCart, 
        removeFromCart, 
        updateItemQuantity, 
        clearCart,
        updateCart,
        checkout,
        isLoading
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Export the context so it can be used by the useCart hook
export { CartContext };
