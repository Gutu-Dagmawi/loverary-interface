# Authentication API Documentation

This document explains how to handle user authentication with the Loverary API.

## Table of Contents
1. [User Registration](#user-registration)
2. [User Login](#user-login)
3. [Current User](#current-user)
4. [User Logout](#user-logout)
5. [Error Handling](#error-handling)

## User Registration

Create a new user account.

**Endpoint**: `POST /users`

### Request Body
```json
{
  "user": {
    "username": "johndoe",
    "email": "john@example.com",
    "password": "securepassword123"
  }
}
```

### Required Fields
- `username`: String (3-50 characters)
- `email`: String (valid email format)
- `password`: String (minimum 6 characters)

### Success Response (201 Created)
```json
{
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

### Error Response (422 Unprocessable Entity)
```json
{
  "errors": [
    "Email has already been taken",
    "Password is too short (minimum is 6 characters)"
  ]
}
```

## User Login

Authenticate a user and create a new session.

**Endpoint**: `POST /users/login`

### Request Body
```json
{
  "user": {
    "email": "john@example.com",
    "password": "securepassword123"
  }
}
```

### Required Fields
- `email`: String (user's email)
- `password`: String (user's password)

### Success Response (200 OK)
```json
{
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

### Error Response (401 Unauthorized)
```json
{
  "error": "Invalid email or password"
}
```

## Current User

Get the currently authenticated user's information.

**Endpoint**: `GET /users/current`

### Headers
- `Cookie`: `_loverary_session=<session_token>` (automatically handled by browser)

### Success Response (200 OK)
```json
{
  "id": 1,
  "email": "john@example.com",
  "username": "johndoe"
}
```

### Error Response (401 Unauthorized)
```json
{
  "error": "Not authenticated"
}
```

## User Logout

Terminate the current user's session.

**Endpoint**: `DELETE /logout`

### Headers
- `Cookie`: `_loverary_session=<session_token>` (automatically handled by browser)

### Success Response (200 OK)
```json
{
  "message": "logout successful"
}
```

## Error Handling

All API endpoints follow these error patterns:

- **400 Bad Request**: Invalid request format
- **401 Unauthorized**: Authentication required or invalid credentials
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **422 Unprocessable Entity**: Validation errors
- **500 Internal Server Error**: Server error

### Common Error Response Format
```json
{
  "error": "Descriptive error message"
}
```

### Validation Errors
When validation fails (422), the response will include specific error messages:
```json
{
  "errors": [
    "Email can't be blank",
    "Password is too short (minimum is 6 characters)"
  ]
}
```
