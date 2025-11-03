# AI Agent Instructions for Game Store MERN

## Project Architecture

This is a MERN stack e-commerce application for games with these key components:

- **Frontend** (`/frontend`): React + Vite app using Tailwind CSS
  - Context-based state management (`/contexts`)
  - Protected routes for user/admin areas
  - Lazy-loaded admin components
  - Stripe integration for payments

- **Backend** (`/backend`): Express.js REST API
  - MongoDB with Mongoose for data persistence
  - JWT-based authentication via cookies
  - Role-based access control (user/admin)
  - File upload handling for game images
  - Stripe webhook integration

## Key Development Workflows

1. **Local Development Setup**:
   ```bash
   # Backend
   cd backend && npm install
   cp .env.example .env  # Configure MONGO_URI and STRIPE keys
   npm run seed  # Creates test data and admin@example.com/AdminPass123!
   npm run dev

   # Frontend
   cd frontend && npm install
   cp .env.example .env.local
   npm run dev
   ```

2. **Testing**:
   - Backend uses Jest + mongodb-memory-server for isolated tests
   - Run tests: `cd backend && npm test`
   - Check coverage: `npm run coverage`

## Project-Specific Patterns

1. **API Error Handling**: Backend uses centralized error middleware in `backend/src/server.js`
   - ValidationError → 400 with field details
   - CastError → 400 for invalid IDs
   - Production vs development error messages

2. **Authentication Flow**:
   - JWT stored in httpOnly cookies
   - Protected routes use `backend/src/middleware/auth.js`
   - Frontend AuthContext provides user state

3. **File Upload**:
   - Images stored in `backend/uploads/`
   - Served statically at `/uploads/*`
   - Use `uploadRoutes` for handling uploads

## Integration Points

1. **Stripe Integration**:
   - Frontend: Elements provider in `App.jsx`
   - Backend: Webhooks must be mounted before `express.json()`
   - Local webhook testing requires Stripe CLI

2. **External APIs**:
   - RAWG API for game data imports
   - Configure via environment variables

## Common Tasks

1. **Adding New Game**:
   - Update schema in `backend/src/models/Game.js`
   - Add controller methods in `gameController.js`
   - Update frontend forms in admin section

2. **User Management**:
   - Admin user created by seed script
   - User roles: 'user' or 'admin'
   - Profile management via `/api/users` endpoints