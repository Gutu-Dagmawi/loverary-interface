# Book Fetching API Documentation

This document explains how to retrieve and filter books from the Loverary API.

## Table of Contents
1. [Get All Books](#get-all-books)
2. [Get Single Book](#get-single-book)
3. [Filtering Books](#filtering-books)
   - [By Availability](#by-availability)
   - [By Author](#by-author)
   - [By Category](#by-category)
   - [By Price Range](#by-price-range)
   - [By Search Query](#by-search-query)
4. [Sorting](#sorting)
5. [Pagination](#pagination)
6. [Error Handling](#error-handling)

## Get All Books

Retrieve a list of all available books.

**Endpoint**: `GET /books`

### Query Parameters
- `include`: String (comma-separated list of related resources to include, e.g., `reviews,author`)
- `page`: Integer (page number for pagination, default: 1)
- `per_page`: Integer (number of items per page, default: 20, max: 100)

### Success Response (200 OK)
```json
{
  "books": [
    {
      "id": 1,
      "title": "The Great Gatsby",
      "author": "F. Scott Fitzgerald",
      "price": 12.99,
      "stock": 15,
      "cover_url": "/covers/great-gatsby.jpg",
      "average_rating": 4.2,
      "review_count": 128
    },
    {
      "id": 2,
      "title": "To Kill a Mockingbird",
      "author": "Harper Lee",
      "price": 10.99,
      "stock": 8,
      "cover_url": "/covers/mockingbird.jpg",
      "average_rating": 4.5,
      "review_count": 256
    }
  ],
  "meta": {
    "current_page": 1,
    "total_pages": 5,
    "total_count": 87,
    "per_page": 20
  }
}
```

## Get Single Book

Retrieve detailed information about a specific book, including reviews if requested.

**Endpoint**: `GET /books/:id`

### URL Parameters
- `id`: Integer (ID of the book to retrieve)

### Query Parameters
- `include`: String (comma-separated list of related resources to include, e.g., `reviews,author`)

### Success Response (200 OK)
```json
{
  "id": 1,
  "title": "The Great Gatsby",
  "author": {
    "id": 3,
    "name": "F. Scott Fitzgerald",
    "bio": "American novelist and short story writer..."
  },
  "isbn": "9780743273565",
  "description": "A story of decadence and excess...",
  "price": 12.99,
  "stock": 15,
  "published_date": "1925-04-10",
  "page_count": 180,
  "language": "English",
  "cover_url": "/covers/great-gatsby.jpg",
  "average_rating": 4.2,
  "review_count": 128,
  "categories": [
    {
      "id": 5,
      "name": "Classic Literature"
    },
    {
      "id": 8,
      "name": "American Literature"
    }
  ],
  "reviews": [
    {
      "id": 42,
      "rating": 5,
      "comment": "A timeless classic!",
      "user": {
        "id": 12,
        "username": "booklover42"
      },
      "created_at": "2025-07-15T14:30:00.000Z"
    },
    {
      "id": 43,
      "rating": 4,
      "comment": "Beautiful prose, though the characters are unlikable.",
      "user": {
        "id": 15,
        "username": "literary_critic"
      },
      "created_at": "2025-07-10T09:15:00.000Z"
    }
  ]
}
```

## Filtering Books

### By Availability

Filter books by their stock status.

**Endpoint**: `GET /books?in_stock=true`

#### Query Parameters
- `in_stock`: Boolean (true = only books with stock > 0)

### By Author

Filter books by author ID.

**Endpoint**: `GET /books?author_id=3`

#### Query Parameters
- `author_id`: Integer (ID of the author)

### By Category

Filter books by category ID.

**Endpoint**: `GET /books?category_id=5`

#### Query Parameters
- `category_id`: Integer (ID of the category)

### By Price Range

Filter books within a price range.

**Endpoint**: `GET /books?min_price=10&max_price=20`

#### Query Parameters
- `min_price`: Float (minimum price)
- `max_price`: Float (maximum price)

### By Search Query

Search books by title, author, or description.

**Endpoint**: `GET /books?q=gatsby`

#### Query Parameters
- `q`: String (search query)

## Sorting

Sort books by different criteria.

**Endpoint**: `GET /books?sort=price_asc`

### Sort Options
- `newest`: Most recently added first
- `price_asc`: Price low to high
- `price_desc`: Price high to low
- `title_asc`: Title A-Z
- `title_desc`: Title Z-A
- `rating`: Highest rated first
- `popular`: Most purchased first

## Pagination

All list endpoints support pagination.

**Example**: `GET /books?page=2&per_page=10`

### Response Metadata
```json
{
  "books": [...],
  "meta": {
    "current_page": 2,
    "total_pages": 9,
    "total_count": 87,
    "per_page": 10
  }
}
```

## Error Handling

### Common Error Responses

**400 Bad Request**
```json
{
  "error": "Invalid price range"
}
```

**404 Not Found**
```json
{
  "error": "Book not found"
}
```

## Important Notes
1. All prices are in the store's base currency (e.g., USD).
2. Stock levels are updated in real-time.
3. The `average_rating` is calculated based on user reviews (1-5 scale).
4. Image URLs are relative to the API base URL.
5. When including related resources, the response structure may change significantly.
6. Some filters can be combined for more specific queries.
7. The search is case-insensitive and performs partial matches on title, author, and description fields.
