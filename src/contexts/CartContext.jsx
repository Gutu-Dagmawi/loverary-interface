import React, { createContext, useState, useEffect } from 'react';
import { createOrder } from '../services/orderService';
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
      const cartItems = cartData.cart_items || [];
      
      // Fetch book details for each cart item
      const itemsWithBooks = await Promise.all(
        cartItems.map(async (item) => {
          try {
            const bookResponse = await api.get(`/books/${item.book_id}`);
            return {
              ...item,
              book: bookResponse.data || {}
            };
          } catch (err) {
            console.error(`Failed to fetch book ${item.book_id}:`, err);
            return { ...item, book: {} };
          }
        })
      );

      setCart({
        items: itemsWithBooks,
        itemCount: itemsWithBooks.reduce((sum, item) => sum + (item.quantity || 0), 0),
        total: parseFloat(itemsWithBooks.reduce(
          (sum, item) => sum + ((item.book?.price || 0) * (item.quantity || 0)),
          0
        ).toFixed(2))
      });
    } catch (error) {
      console.error('Failed to fetch cart', error);
      // Fallback to empty cart
      setCart({ ...defaultCart });
    } finally {
      setIsLoading(false);
    }
  };

  // Load cart on mount
  useEffect(() => {
    initializeCart();
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
      const newItem = await cartService.addToCart(book.id, quantity);
      
      // Update local state with the server response
      const updatedItems = [...(cart.items || []), {
        ...newItem,
        book: book // Include the full book object from the parameter
      }];
      
      const updatedCart = {
        items: updatedItems,
        itemCount: updatedItems.reduce((sum, item) => sum + (item.quantity || 0), 0),
        total: parseFloat(updatedItems.reduce(
          (sum, item) => sum + ((item.book?.price || 0) * (item.quantity || 0)),
          0
        ).toFixed(2))
      };
      
      setCart(updatedCart);
      return updatedCart;
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

      // Prepare order data
      const orderData = {
        total_price: cart.total,
        items: cart.items.map(item => ({
          book_id: item.book_id,
          quantity: item.quantity,
          price: item.book?.price || 0
        }))
      };

      // Create the order using the order service
      const order = await createOrder(orderData);
      
      // Clear the cart after successful checkout
      await clearCart();
      
      // Return success status and order details
      return { 
        success: true, 
        message: 'Order placed successfully!',
        order
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
