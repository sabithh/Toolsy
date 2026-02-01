# Testing Toolsy API

Quick guide to test the API endpoints using curl or any HTTP client.

## 1. Register a New User (Renter)

```bash
curl -X POST http://localhost:8000/api/users/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "renter1",
    "email": "renter@example.com",
    "password": "testpass123",
    "password_confirm": "testpass123",
    "first_name": "John",
    "last_name": "Doe",
    "user_type": "renter",
    "phone": "1234567890"
  }'
```

## 2. Register a Provider

```bash
curl -X POST http://localhost:8000/api/users/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "provider1",
    "email": "provider@example.com",
    "password": "testpass123",
    "password_confirm": "testpass123",
    "first_name": "Jane",
    "last_name": "Smith",
    "user_type": "provider",
    "phone": "9876543210"
  }'
```

## 3. Login (Get JWT Token)

```bash
curl -X POST http://localhost:8000/api/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "provider1",
    "password": "testpass123"
  }'
```

Save the `access` token from the response!

## 4. Get Current User Profile

```bash
curl -X GET http://localhost:8000/api/users/me/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 5. Create a Shop (Provider only)

```bash
curl -X POST http://localhost:8000/api/shops/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Johns Tool Shop",
    "description": "Best tools in town",
    "address": "123 Main St, City, Country",
    "location_lat": 40.7128,
    "location_lng": -74.0060,
    "phone": "1234567890",
    "email": "shop@example.com",
    "business_hours": {
      "mon": {"open": "09:00", "close": "18:00"},
      "tue": {"open": "09:00", "close": "18:00"}
    }
  }'
```

## 6. Create a Tool (Provider only)

First, get your shop ID from step 5, then:

```bash
curl -X POST http://localhost:8000/api/tools/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Power Drill",
    "description": "Professional grade power drill",
    "brand": "DeWalt",
    "condition": "excellent",
    "quantity_total": 5,
    "quantity_available": 5,
    "price_per_day": 25.00,
    "deposit_amount": 50.00,
    "minimum_rental_duration": 24,
    "is_available": true
  }'
```

## 7. Search Nearby Tools

```bash
curl -X GET "http://localhost:8000/api/tools/nearby/?lat=40.7128&lng=-74.0060&radius=10"
```

## 8. Create a Booking (Renter only)

Login as renter first, then:

```bash
curl -X POST http://localhost:8000/api/bookings/ \
  -H "Authorization: Bearer YOUR_RENTER_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tool_id": "TOOL_UUID_FROM_STEP_6",
    "quantity": 1,
    "start_datetime": "2024-02-15T10:00:00Z",
    "end_datetime": "2024-02-16T10:00:00Z",
    "rental_price": 25.00,
    "deposit_amount": 50.00,
    "payment_method": "cash_on_return"
  }'
```

## 9. Confirm Booking (Shop Owner)

```bash
curl -X POST http://localhost:8000/api/bookings/BOOKING_ID/confirm/ \
  -H "Authorization: Bearer YOUR_PROVIDER_ACCESS_TOKEN"
```

## 10. List All Available Tools

```bash
curl -X GET http://localhost:8000/api/tools/
```

## 11. Search Tools

```bash
curl -X GET "http://localhost:8000/api/tools/?search=drill"
```

## 12. Filter Tools by Category

```bash
curl -X GET "http://localhost:8000/api/tools/?category=CATEGORY_ID"
```

## Testing with Swagger UI

Visit: http://localhost:8000/api/docs/

This provides an interactive interface to test all endpoints!

## Common HTTP Status Codes

- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Permission denied
- `404 Not Found` - Resource not found
- `500 Server Error` - Server error
