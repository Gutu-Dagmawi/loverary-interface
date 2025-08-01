import api from './api';

/**
 * Fetches all orders for the current user
 * @returns {Promise<Array>} Array of orders with their items
 */
export const getOrders = async () => {
  try {
    // In a real app, we would filter by the current user's ID
    // For now, we'll fetch all orders
    const [ordersResponse, orderItemsResponse] = await Promise.all([
      api.get('/orders'),
      api.get('/order_items')
    ]);
    
    // Get all books to include in the order items
    const booksResponse = await api.get('/books');
    const booksMap = booksResponse.data.reduce((acc, book) => ({
      ...acc,
      [book.id]: book
    }), {});
    
    // Combine orders with their items
    const ordersWithItems = ordersResponse.data.map(order => ({
      ...order,
      order_items: orderItemsResponse.data
        .filter(item => item.order_id === order.id)
        .map(item => ({
          ...item,
          book: booksMap[item.book_id] || null
        }))
    }));
    
    return ordersWithItems;
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
    // First check stock availability for all items
    const stockChecks = await Promise.all(
      orderData.items.map(async (item) => {
        const bookResponse = await api.get(`/books/${item.book_id}`);
        const book = bookResponse.data;
        if (book.stock < item.quantity) {
          throw new Error(`Not enough stock for ${book.title}. Available: ${book.stock}, Requested: ${item.quantity}`);
        }
        return { book, item };
      })
    );

    // Update stock for all books
    await Promise.all(
      stockChecks.map(({ book, item }) =>
        api.patch(`/books/${book.id}`, {
          stock: book.stock - item.quantity
        })
      )
    );

    // Create the order
    const orderResponse = await api.post('/orders', {
      user_id: 1, // In a real app, get from auth context
      status: 'pending',
      total_price: orderData.total_price,
    });
    
    // Create order items
    const orderItems = await Promise.all(
      orderData.items.map(item => 
        api.post('/order_items', {
          order_id: orderResponse.data.id,
          book_id: item.book_id,
          quantity: item.quantity,
          price: item.price
        })
      )
    );
    
    return {
      ...orderResponse.data,
      order_items: orderItems.map(res => res.data)
    };
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export default {
  getOrders,
  createOrder
};
