# Start CafeQ

CafeQ has two applications that run at the same time:

- `backend/`: Express API at `http://localhost:5000`
- `frontend/`: React and Vite app at `http://localhost:8443`

## Requirements

- Node.js 22 or later (`node --version`)
- npm 10 or later (`npm --version`)
- A MongoDB deployment that supports transactions. MongoDB Atlas is the simplest option for local development.
- Razorpay test credentials if you plan to complete payment testing.

## 1. Configure environment files

Create the backend environment file and fill in the required values.

### Windows PowerShell

```powershell
Copy-Item backend\.env.example backend\.env
notepad backend\.env
```

### Linux

```bash
cp backend/.env.example backend/.env
nano backend/.env
```

Set these values in `backend/.env`:

```dotenv
PORT=5000
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=a-long-random-secret
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
FRONTEND_ORIGIN=http://localhost:8443
```

Create the frontend environment file.

### Windows PowerShell

```powershell
Copy-Item frontend\.env.example frontend\.env
notepad frontend\.env
```

### Linux

```bash
cp frontend/.env.example frontend/.env
nano frontend/.env
```

Leave `VITE_API_BASE_URL=http://localhost:5000`. Set `VITE_RAZORPAY_KEY_ID` to the same public Razorpay key ID as the backend when testing payments. Never put `RAZORPAY_KEY_SECRET` in the frontend file.

## 2. Install dependencies

Run these commands once from the project root.

### Windows PowerShell

```powershell
cd backend
npm install
cd ..\frontend
npm install
cd ..
```

### Linux

```bash
cd backend
npm install
cd ../frontend
npm install
cd ..
```

## 3. Seed the Lassi Wassi menu

With MongoDB configured and the backend dependencies installed, run this once from `backend/`:

```bash
npm run seed:menu
```

This command is safe to repeat. It updates the 83 Lassi Wassi menu items and creates development inventory for each one.

To remove older menu items that are outside the catalogue, use:

```bash
npm run seed:menu -- --reset
```

The reset command keeps historical orders but removes stale menu items, their inventory records, cart references, and reviews.

To update images on existing menu items from the root `url.txt` file, run `npm run sync:menu-images` in `backend/`. Each line should be `Item Name: URL`. The script also accepts image data URIs, reports names not found in the database, and leaves unlisted items' images unchanged. Future menu seed runs use the same file for matching catalogue items.

## 4. Start the backend

Open a terminal at the project root.

### Windows PowerShell

```powershell
cd backend
npm run dev
```

### Linux

```bash
cd backend
npm run dev
```

Keep this terminal open. A successful startup prints that MongoDB is connected and that the server is running on port 5000.

## 5. Start the frontend

Open a second terminal at the project root.

### Windows PowerShell

```powershell
cd frontend
npm run dev -- --host 0.0.0.0
```

### Linux

```bash
cd frontend
npm run dev -- --host 0.0.0.0
```

Open the local address printed by Vite, normally `http://localhost:8443`.

## Verify the setup

1. Open `http://localhost:8443`.
2. Register a customer account and sign in.
3. Confirm the menu shows Lassi Wassi categories and items.
4. Add an item to the cart and place an order using a configured Razorpay test account.

For API routes and request formats, see [backend/API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md).

## Common problems

- **The frontend says it cannot reach CafeQ:** ensure the backend is running on port 5000 and that `frontend/.env` has `VITE_API_BASE_URL=http://localhost:5000`. Restart Vite after changing `.env`.
- **MongoDB connection fails:** check `MONGO_URI`, confirm your Atlas network access rules permit your current IP address, and use a deployment that supports transactions.
- **CORS error in the browser:** ensure `FRONTEND_ORIGIN` exactly matches the Vite address, usually `http://localhost:8443`, then restart the backend.
- **`npm run seed:menu` fails:** install backend dependencies first, configure `MONGO_URI`, and ensure MongoDB is reachable.
- **Payments fail:** set matching Razorpay test-mode key IDs in `backend/.env` and `frontend/.env`, and keep the Razorpay secret only in `backend/.env`.
