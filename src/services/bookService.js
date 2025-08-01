import api from './api';

/**
 * @typedef {Object} Book
 * @property {number} id - Unique identifier for the book
 * @property {string} title - Title of the book
 * @property {string} isbn - International Standard Book Number
 * @property {string} language - Language of the book content
 * @property {number} page_count - Number of pages
 * @property {number} stock - Number of copies available
 * @property {number} price - Price in USD
 * @property {number} author_id - ID of the author
 * @property {string} summary - Brief description of the book
 * @property {string} published_date - Publication date (YYYY-MM-DD)
 * @property {string} edition - Edition information
 * @property {string} cover_url - URL to the book cover image
 */

/**
 * @typedef {Object} PaginationMeta
 * @property {number} current_page - Current page number
 * @property {number|null} next_page - Next page number or null if on last page
 * @property {number|null} prev_page - Previous page number or null if on first page
 * @property {number} total_pages - Total number of pages
 * @property {number} total_count - Total number of items across all pages
 */

/**
 * @typedef {Object} BooksResponse
 * @property {Book[]} books - Array of book objects
 * @property {PaginationMeta} meta - Pagination metadata
 */

/**
 * Fetches books from the API with optional filtering and pagination
 * @param {Object} [params] - Query parameters
 * @param {number} [params.page=1] - Page number for pagination
 * @param {number} [params.per_page=10] - Number of items per page (max: 100)
 * @param {boolean} [params.in_stock] - Filter books that are in stock
 * @param {number} [params.author_id] - Filter by author ID
 * @param {number} [params.category_id] - Filter by category ID
 * @param {boolean} [includeOutOfStock=false] - Whether to include out-of-stock books in results
 * @returns {Promise<{books: Book[], meta: PaginationMeta}>} Object containing books array and pagination metadata
 * @throws {Error} If the API request fails with a non-2xx status code
 */
export const getBooks = async (params = {}, includeOutOfStock = false) => {
  // Ensure we have valid pagination parameters
  const safeParams = {
    page: Math.max(1, parseInt(params.page) || 1),
    per_page: Math.min(100, Math.max(1, parseInt(params.per_page) || 10)),
    ...params
  };

  // Remove undefined values to keep the URL clean
  Object.keys(safeParams).forEach(key => 
    safeParams[key] === undefined && delete safeParams[key]
  );

  try {
    const response = await api.get('/books', { params: safeParams });
    
    // Handle different response formats
    let books = [];
    let meta = {
      current_page: 1,
      next_page: null,
      prev_page: null,
      total_pages: 1,
      total_count: 0
    };
    
    // Extract books array from response
    if (Array.isArray(response.data)) {
      books = response.data;
    } else if (response.data && Array.isArray(response.data.books)) {
      books = response.data.books;
      meta = { ...meta, ...response.data.meta };
    } else if (response.data && response.data.data) {
      books = response.data.data;
      meta = { ...meta, ...response.data.meta };
    } else {
      console.warn('Unexpected API response format:', response.data);
      return { books: [], meta };
    }
    
    // Filter out out-of-stock books unless explicitly requested
    if (!includeOutOfStock) {
      books = books.filter(book => book && typeof book === 'object' && book.stock > 0);
    }
    
    return { books, meta };
  } catch (error) {
    console.error('Error fetching books:', {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url,
      params: error.config?.params
    });
    
    // Rethrow with more context
    const errorMessage = error.response?.data?.error || 'Failed to fetch books';
    const apiError = new Error(errorMessage);
    apiError.status = error.response?.status;
    apiError.details = error.response?.data?.details;
    throw apiError;
  }
};

/**
 * Fetches a single book by its ID
 * @param {number|string} id - The ID of the book to fetch
 * @returns {Promise<Book>} The book object
 * @throws {Error} If the book is not found or another error occurs
 */
export const getBookById = async (id) => {
  if (!id) {
    throw new Error('Book ID is required');
  }

  try {
    const response = await api.get(`/books/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching book with id ${id}:`, {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url
    });

    if (error.response?.status === 404) {
      const notFoundError = new Error(`Book with ID ${id} not found`);
      notFoundError.status = 404;
      throw notFoundError;
    }

    const apiError = new Error(error.response?.data?.error || 'Failed to fetch book');
    apiError.status = error.response?.status;
    apiError.details = error.response?.data?.details;
    throw apiError;
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
