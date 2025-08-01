import api from './api';

/**
 * Fetches books from the API
 * @param {Object} params - Query parameters for filtering/sorting
 * @param {boolean} [includeOutOfStock=false] - Whether to include out-of-stock books
 * @returns {Promise<Array>} Array of books
 */
export const getBooks = async (params = {}, includeOutOfStock = false) => {
  try {
    const response = await api.get('/books', { params });
    
    // Filter out out-of-stock books unless explicitly requested
    let books = response.data;
    if (!includeOutOfStock) {
      books = books.filter(book => book.stock > 0);
    }
    
    return books;
  } catch (error) {
    console.error('Error fetching books:', error);
    throw error;
  }
};

export const getBookById = async (id) => {
  try {
    const response = await api.get(`/books/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching book with id ${id}:`, error);
    throw error;
  }
};

export const createBook = async (bookData) => {
  try {
    const response = await api.post('/books', bookData);
    return response.data;
  } catch (error) {
    console.error('Error creating book:', error);
    throw error;
  }
};

export const updateBook = async (id, bookData) => {
  try {
    const response = await api.put(`/books/${id}`, bookData);
    return response.data;
  } catch (error) {
    console.error(`Error updating book with id ${id}:`, error);
    throw error;
  }
};

export const deleteBook = async (id) => {
  try {
    const response = await api.delete(`/books/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting book with id ${id}:`, error);
    throw error;
  }
};
