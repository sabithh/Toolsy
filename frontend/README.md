# Toolsy Frontend

Next.js frontend for Toolsy tool rental platform.

## Tech Stack

- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State:** React Context API
- **HTTP Client:** Fetch API

## Design System

### Colors
- **Primary:** Crimson Red (#DC2626)
- **Secondary:** Ink Black (#0F172A)
- **Accent:** Amber (#F59E0B)

### Typography
- **Font:** Inter (system fallback)

## Getting Started

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_key_here
```

### 3. Run Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page
│   ├── login/page.tsx     # Login page
│   ├── register/page.tsx  # Registration page
│   └── tools/page.tsx     # Tools browsing
├── components/            # Reusable components
│   └── Navbar.tsx        # Navigation bar
├── contexts/              # React contexts
│   └── AuthContext.tsx   # Authentication state
├── lib/                   # Utilities
│   └── api.ts            # API client
└── public/               # Static assets
```

## Features

✅ User authentication (JWT)  
✅ Browse tools with search  
✅ Responsive design  
✅ Role-based UI (Renter/Provider)  
✅ Real-time API integration

## Available Pages

- `/` - Landing page
- `/login` - User login
- `/register` - User registration
- `/tools` - Browse all tools
- `/tools/[id]` - Tool details (to be built)
- `/bookings` - My bookings (to be built)
- `/dashboard` - Provider dashboard (to be built)

## API Integration

The frontend connects to Django backend at `http://localhost:8000`.

All API calls use the `api` client in `lib/api.ts`.

## Commands

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Production server
npm run lint     # Run ESLint
```

## Next Steps

1. Build tool details page
2. Add booking functionality
3. Create provider dashboard
4. Implement Razorpay integration
5. Add map view for location search
