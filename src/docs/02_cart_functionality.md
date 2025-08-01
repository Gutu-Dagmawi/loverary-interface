# Cart Functionality API Documentation

This document explains how to manage shopping cart operations with the Loverary API.

## Table of Contents
1. [Add Items to Cart](#add-items-to-cart)
2. [Update Cart Item Quantity](#update-cart-item-quantity)
3. [Remove Item from Cart](#remove-item-from-cart)
4. [Clear Cart](#clear-cart)
5. [Checkout](#checkout)
6. [Error Handling](#error-handling)

## Authentication
All cart endpoints require authentication. Include the session cookie in your requests (handled automatically by browsers).

## Add Items to Cart

Add one or more items to the user's cart.

**Endpoint**: `POST /users/:user_id/cart/add`

### Headers
- `Content-Type`: `application/json`
- `Cookie`: `_loverary_session=<session_token>`

### Request Body
```json
{
  "items": [
    {
      "book_id": 1,
      "quantity": 2,
      "price": 19.99
    },
    {
      "book_id": 3,
      "quantity": 1,
      "price": 24.99
    }
  ]
}
```

### Required Fields per Item
- `book_id`: Integer (ID of the book to add)
- `quantity`: Integer (number of copies, must be > 0)
- `price`: Float (price per unit)

### Success Response (200 OK)
```json
{
  "message": "successfully added item/s to cart",
  "cart": {
    "count": 3,
    "items": [
      {
        "book_id": 1,
        "quantity": 2,
        "price": 19.99
      },
      {
        "book_id": 3,
        "quantity": 1,
        "price": 24.99
      }
    ]
  }
}
```

### Error Response (406 Not Acceptable)
```json
{
  "message": "no valid items"
}
```

## Update Cart Item Quantity

Update the quantity of a specific item in the cart.

**Endpoint**: `PATCH /users/:user_id/cart`

### Headers
- `Content-Type`: `application/json`
- `Cookie`: `_loverary_session=<session_token>`

### Request Body
```json
{
  "book_id": 1,
  "quantity": 3
}
```

### Required Fields
- `book_id`: Integer (ID of the book to update)
- `quantity`: Integer (new quantity, must be > 0)

### Success Response (200 OK)
```json
{
  "message": "cart updated",
  "cart": {
    "count": 4,
    "items": [
      {
        "book_id": 1,
        "quantity": 3,
        "price": 19.99
      },
      {
        "book_id": 3,
        "quantity": 1,
        "price": 24.99
      }
    ]
  }
}
```

## Remove Item from Cart

Remove a specific item from the cart.

**Endpoint**: `DELETE /users/:user_id/cart/remove/:book_id`

### URL Parameters
- `book_id`: Integer (ID of the book to remove)

### Success Response (200 OK)
```json
{
  "message": "item removed",
  "cart": {
    "count": 1,
    "items": [
      {
        "book_id": 3,
        "quantity": 1,
        "price": 24.99
      }
    ]
  }
}
```

### Error Response (404 Not Found)
```json
{
  "message": "item not found in cart"
}
```

## Clear Cart

Remove all items from the cart.

**Endpoint**: `DELETE /users/:user_id/cart/clear`

### Success Response (200 OK)
```json
{
  "message": "cart cleared",
  "cart": {
    "count": 0,
    "items": []
  }
}
```

## Checkout

Convert the current cart into an order.

**Endpoint**: `POST /users/:user_id/cart/checkout`

### Success Response (200 OK)
```json
{
  "message": "checked out successfully",
  "order": {
    "id": 42,
    "user_id": 1,
    "status": "pending",
    "total_price": 64.97,
    "created_at": "2025-08-01T20:15:30.000Z"
  }
}
```

### Error Response (404 Not Found)
```json
{
  "message": "cart empty"
}
```

## Error Handling

### Common Error Responses

**401 Unauthorized**
```json
{
  "error": "Please log in"
}
```

**404 Not Found**
```json
{
  "message": "item not found in cart"
}
```

**406 Not Acceptable**
```json
{
  "message": "no valid items"
}
```

## Important Notes
1. The cart is stored in the user's session and requires authentication.
2. All prices should be sent as floats with exactly 2 decimal places.
3. The cart will automatically validate book availability (stock) before adding items.
4. After successful checkout, the cart is automatically cleared.
5. The `count` in responses represents the total number of items (sum of all quantities).
