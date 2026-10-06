# CafeQ

CafeQ has a React 19, TypeScript, Vite, and Tailwind frontend in `frontend/` and an Express backend in `backend/`. The frontend uses the backend routes documented in [backend/API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md). Its browser requests include the JWT cookie.

For local development, install each project's dependencies and start the backend on port 5000 and the frontend on port 8443. The backend needs `MONGO_URI`, `JWT_SECRET`, `RAZORPAY_KEY_ID`, and `RAZORPAY_KEY_SECRET` in `backend/.env`. Set `GEMINI_API_KEY` and `GEMINI_MODEL` to enable the customer food-assistant chatbot. Order creation uses a MongoDB transaction, so the MongoDB deployment must support transactions.

Copy `backend/.env.example` to `backend/.env` and `frontend/.env.example` to `frontend/.env`. `VITE_API_BASE_URL` defaults to `http://localhost:5000`; set `VITE_RAZORPAY_KEY_ID` to the public key ID that matches the backend Razorpay account before testing payments. Keep the Razorpay secret only in the backend. For a frontend served from a different origin, set backend `FRONTEND_ORIGIN` to that exact origin; localhost ports 5173 and 8443 are accepted by default.

## Deploy the frontend to Vercel

In Vercel, import this repository and set the project root directory to `frontend`. Vercel will use the included `frontend/vercel.json` rewrites: `/api/*` is proxied to `https://cafeq-etz2.onrender.com`, and other paths serve the Vite app for client-side routing. Leave `VITE_API_BASE_URL` unset in Vercel so API calls use the same-origin proxy; this also keeps login cookies on the frontend origin. Set `VITE_GOOGLE_CLIENT_ID` in Vercel if Google sign-in is needed, and add the deployed frontend origin to that OAuth client's authorized JavaScript origins. Local development uses `VITE_API_BASE_URL=http://localhost:5000` from `frontend/.env`.

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

To apply images listed as `Item Name: URL` in the root `url.txt` to existing menu items, run `npm run sync:menu-images` from `backend/`. The command reports names that are not currently in the database. Seeding also applies listed images to matching catalogue items and preserves existing images for unlisted items.
The landing-page slideshow reads the same `url.txt` when the frontend builds and changes images every 3.5 seconds, so include that file when building or deploying the frontend.

The backend currently returns only a time slot ID in customer order history, so older orders may show unavailable pickup details. The time slot listing route returns active slots only, so deactivated slots can be reactivated in the current admin session but disappear from that list after a refresh. The menu response has no popularity flag; the featured row shows available items as “Today's Picks.”
