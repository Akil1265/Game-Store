# Game Store MERN (local dev)

This repository is a local-development-ready MERN stack sample for a Game Store.

See the backend and frontend folders for instructions. After creating the repo run the install steps below.

Quick start

1. Backend

```powershell
cd backend
npm install
cp .env.example .env
# edit .env as needed (set MONGO_URI, STRIPE keys if available)
npm run seed
npm run dev
```

2. Frontend

```powershell
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Notes
- Use Stripe CLI to forward webhooks locally: stripe listen --forward-to http://localhost:5000/api/webhooks/stripe
- Seed script creates an admin user admin@example.com / AdminPass123!
