# Toolsy Backend

Django REST API for Toolsy tool rental platform.

## Tech Stack

- Django 5.0
- Django REST Framework 3.14+
- PostgreSQL with PostGIS
- JWT Authentication
- Razorpay Payment Integration

## Project Structure

```
backend/
├── config/          # Django project settings
├── apps/            # Application modules
│   ├── users/       # User management
│   ├── shops/       # Shop management
│   ├── tools/       # Tool listings
│   ├── bookings/    # Booking system
│   └── payments/    # Payment integration
├── core/            # Shared utilities
└── requirements.txt
```

## Setup

### 1. Create Virtual Environment

```bash
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Environment Variables

Create `.env` file:

```env
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://user:pass@localhost:5432/toolsy
RAZORPAY_KEY_ID=your-key
RAZORPAY_KEY_SECRET=your-secret
```

### 4. Run Migrations

```bash
python manage.py migrate
```

### 5. Create Superuser

```bash
python manage.py createsuperuser
```

### 6. Run Development Server

```bash
python manage.py runserver
```

## API Documentation

API docs available at `/api/docs/` (Swagger UI)
