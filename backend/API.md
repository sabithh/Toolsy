# Toolsy API Endpoints

Base URL: `http://localhost:8000/api/`

## Authentication

### JWT Token
- **POST** `/api/auth/token/` - Obtain JWT token (login)
  ```json
  {
    "username": "user",
    "password": "password"
  }
  ```
  Response:
  ```json
  {
    "access": "eyJ...",
    "refresh": "eyJ..."
  }
  ```

- **POST** `/api/auth/token/refresh/` - Refresh access token
  ```json
  {
    "refresh": "eyJ..."
  }
  ```

## Users

- **POST** `/api/users/` - Register new user
- **GET** `/api/users/me/` - Get current user profile (auth required)
- **PATCH** `/api/users/update_profile/` - Update current user profile (auth required)
- **GET** `/api/users/` - List all users (auth required)
- **GET** `/api/users/{id}/` - Get user by ID

## Shops

- **GET** `/api/shops/` - List all shops
- **POST** `/api/shops/` - Create shop (auth required, provider only)
- **GET** `/api/shops/{id}/` - Get shop details
- **PATCH** `/api/shops/{id}/` - Update shop (auth required, owner only)
- **DELETE** `/api/shops/{id}/` - Delete shop (auth required, owner only)
- **GET** `/api/shops/nearby/?lat={lat}&lng={lng}&radius={km}` - Find nearby shops
- **GET** `/api/shops/my_shops/` - Get current user's shops (auth required)

## Tools

- **GET** `/api/tools/` - List all tools
- **POST** `/api/tools/` - Create tool (auth required, provider only)
- **GET** `/api/tools/{id}/` - Get tool details
- **PATCH** `/api/tools/{id}/` - Update tool (auth required, owner only)
- **DELETE** `/api/tools/{id}/` - Delete tool (auth required, owner only)
- **GET** `/api/tools/nearby/?lat={lat}&lng={lng}&radius={km}` - Find nearby tools

### Tool Categories

- **GET** `/api/categories/` - List all tool categories
- **GET** `/api/categories/{id}/` - Get category details

## Bookings

- **GET** `/api/bookings/` - List bookings (filtered by user type)
- **POST** `/api/bookings/` - Create booking (auth required, renter only)
- **GET** `/api/bookings/{id}/` - Get booking details
- **POST** `/api/bookings/{id}/confirm/` - Confirm booking (shop owner only)
- **POST** `/api/bookings/{id}/cancel/` - Cancel booking (renter or shop owner)

### Create Booking Example
```json
{
  "tool_id": "uuid-here",
  "quantity": 1,
  "start_datetime": "2024-02-01T10:00:00Z",
  "end_datetime": "2024-02-02T10:00:00Z",
  "rental_price": 100.00,
  "deposit_amount": 50.00,
  "payment_method": "razorpay",
  "notes": "Optional notes"
}
```

## Reviews

- **GET** `/api/reviews/` - List all reviews
- **POST** `/api/reviews/` - Create review (auth required)
- **GET** `/api/reviews/{id}/` - Get review details

## Notifications

- **GET** `/api/notifications/` - List user notifications (auth required)
- **POST** `/api/notifications/{id}/mark_read/` - Mark as read
- **POST** `/api/notifications/mark_all_read/` - Mark all as read

## API Documentation

- **Swagger UI**: http://localhost:8000/api/docs/
- **Schema**: http://localhost:8000/api/schema/

## Query Parameters

### Filtering (All list endpoints)
- `?search=query` - Search by name/description
- `?ordering=field` - Order by field (use `-field` for descending)
- `?category=id` - Filter by category (tools)
- `?status=value` - Filter by status (bookings)

### Pagination
- `?page=1` - Page number
- `?page_size=20` - Items per page (default: 20)

## Authentication Header

For protected endpoints, include JWT token:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
