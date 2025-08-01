import api from './api';

/**
 * Fetches all orders for the current user
 * @returns {Promise<Array>} Array of orders with their items
 */
export const getOrders = async () => {
  try {
    // Fetch orders for the current user with their items included
    const response = await api.get('/users/orders');
    // The response has an 'orders' key containing the array of orders
    return response.data.orders;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

/**
 * Creates a new order from the current cart
 * @param {Object} orderData - The order data including items
 * @returns {Promise<Object>} The created order
 */
export const createOrder = async (orderData) => {
  try {
    // Create the order through the users endpoint
    // The backend will set the appropriate status
    const response = await api.post('/users/orders', {
      items: orderData.items,
      total_price: orderData.total_price
    });
    
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export default {
  getOrders,
  createOrder
};
