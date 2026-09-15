# CafeQ

CafeQ has a React 19, TypeScript, Vite, and Tailwind frontend in `frontend/` and an Express backend in `backend/`. The frontend uses the backend routes documented in [backend/API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md). Its browser requests include the JWT cookie.

For local development, install each project's dependencies and start the backend on port 5000 and the frontend on port 8443. The backend needs `MONGO_URI`, `JWT_SECRET`, `RAZORPAY_KEY_ID`, and `RAZORPAY_KEY_SECRET` in `backend/.env`. Order creation uses a MongoDB transaction, so the MongoDB deployment must support transactions.

Copy `backend/.env.example` to `backend/.env` and `frontend/.env.example` to `frontend/.env`. `VITE_API_BASE_URL` defaults to `http://localhost:5000`; set `VITE_RAZORPAY_KEY_ID` to the public key ID that matches the backend Razorpay account before testing payments. Keep the Razorpay secret only in the backend. For a frontend served from a different origin, set backend `FRONTEND_ORIGIN` to that exact origin; localhost ports 5173 and 8443 are accepted by default.

## Seed the Lassi Wassi menu

After configuring `backend/.env`, seed or update the Lassi Wassi catalogue and its development inventory records with:

```bash
cd backend
npm run seed:menu
```

To replace an existing demo catalogue, remove menu items outside the Lassi Wassi seed, and remove their inventory, cart, and review references, run:

```bash
npm run seed:menu -- --reset
```

The reset command deliberately does not delete historical orders. Their embedded item names and prices remain available as the order record.

The backend currently returns only a time slot ID in customer order history, so older orders may show unavailable pickup details. The time slot listing route returns active slots only, so deactivated slots can be reactivated in the current admin session but disappear from that list after a refresh. The menu response has no popularity flag; the featured row shows available items as “Today's Picks.”
