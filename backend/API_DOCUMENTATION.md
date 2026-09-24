# CafeQ Backend API Documentation

## Base URL
`http://localhost:5000` (or your deployed domain)

## Authentication

Authentication is handled via JWT. The token is expected either in the `token` cookie or the `Authorization` header as a Bearer token (`Bearer <token>`).

### Register
**Method and URL:** `POST /api/auth/register`
**Authentication:** Public
**Request Body:**
```json
{
  "name": "John Doe",           // Required
  "email": "user@example.com",  // Required
  "password": "password123",    // Required
  "phone": "1234567890"         // Required
}
```
*Note: Public registrations automatically become `CUSTOMER`. If `role` is passed in the payload, the backend ignores it. Registration sends an email OTP and does not authenticate the user until verification.*

**Success Response:** `201 Created`
```json
{
  "message": "Verification code sent to your email. Please verify your email to complete registration.",
  "requiresEmailVerification": true,
  "email": "user@example.com"
}
```

### Verify Email OTP
**Method and URL:** `POST /api/auth/verify-otp`
**Authentication:** Public (sets `token` cookie on success)
**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```
The OTP expires after 10 minutes. A maximum of 5 failed attempts is allowed.

### Resend Email OTP
**Method and URL:** `POST /api/auth/resend-otp`
**Authentication:** Public
**Request Body:**
```json
{
  "email": "user@example.com"
}
```
Resend requests have a 60-second cooldown.

### Login
**Method and URL:** `POST /api/auth/login`
**Authentication:** Public
**Request Body:** (Provide EITHER email OR phone, plus password)
```json
{
  "email": "user@example.com", // Provide email OR phone
  "password": "password123"    // Required
}
```
*OR*
```json
{
  "phone": "1234567890",       // Provide phone OR email
  "password": "password123"    // Required
}
```
**Success Response:** `200 OK` (Sets `token` cookie)
```json
{
  "message": "User logged in successfully",
  "user": {
    "id": "64c8f...",
    "name": "John Doe",
    "email": "user@example.com",
    "phone": "1234567890",
    "role": "CUSTOMER"
  }
}
```
Unverified users receive `403 Forbidden` with `Please verify your email before logging in.`

### Logout
**Method and URL:** `POST /api/auth/logout`
**Authentication:** Public (Clears cookie)
**Success Response:** `200 OK`
```json
{
  "message": "User logged out successfully"
}
```

### Get Current User
**Method and URL:** `GET /api/auth/me`
**Authentication:** Authenticated user
**Success Response:** `200 OK`
```json
{
  "message": "User fetched successfully",
  "user": {
    "id": "64c8f...",
    "name": "John Doe",
    "email": "user@example.com",
    "phone": "1234567890",
    "role": "CUSTOMER",
    "isVerified": false
  }
}
```

---

## Menu

### Create Menu Item
**Method and URL:** `POST /api/menu/menu`
**Authentication:** Admin only
**Request Body:**
```json
{
  "name": "Cappuccino",    // Required
  "description": "Rich",   // Optional
  "price": 120,            // Required
  "category": "Beverages", // Required
  "image": "url.jpg",      // Optional
  "isAvailable": true      // Optional, default true
}
```
**Success Response:** `201 Created`
```json
{
  "message": "Menu item created successfully",
  "menuItem": {
    "_id": "64c...",
    "name": "Cappuccino",
    "price": 120,
    "category": "Beverages"
  }
}
```

### Get Menu Items
**Method and URL:** `GET /api/menu/menu`
**Authentication:** Authenticated user
**Query Parameters:**
- `category` (String, Optional): Filter by category.
- `search` (String, Optional): Search in name or description (case-insensitive).
- `available` (String, Optional): Filter by availability (`true` or `false`).
- `page` (Number, Optional): Page number (default: 1).
- `limit` (Number, Optional): Items per page (default: 5).

**Success Response:** `200 OK`
```json
{
  "message": "Menu items retrieved successfully",
  "menuItems": [
    {
      "_id": "64c...",
      "name": "Cappuccino",
      "price": 120
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 5,
  "totalPages": 1
}
```

### Update Menu Item
**Method and URL:** `PUT /api/menu/menu/:id`
**Authentication:** Admin only
**Path Parameters:**
- `id` (String): The ID of the menu item to update.
**Request Body:** (Partial updates supported)
```json
{
  "price": 150
}
```
**Success Response:** `200 OK`
```json
{
  "message": "Menu item updated successfully",
  "menuItem": {
    "_id": "64c...",
    "price": 150
  }
}
```

### Delete Menu Item
**Method and URL:** `DELETE /api/menu/menu/:id`
**Authentication:** Admin only
**Path Parameters:**
- `id` (String): The ID of the menu item to delete.
**Success Response:** `200 OK`
```json
{
  "message": "Menu item deleted successfully"
}
```

---

## Cart

### Add to Cart
**Method and URL:** `POST /api/cart/add-to-cart`
**Authentication:** Authenticated user
**Request Body:**
```json
{
  "menuItemId": "64c8f...", // Required: Menu Item ID
  "quantity": 2             // Required: 1 or more
}
```
**Success Response:** `200 OK`
```json
{
  "message": "Item added to cart",
  "cart": {
    "_id": "64d...",
    "user": "64c8f...",
    "items": [
      {
        "menuItem": "64c8f...",
        "quantity": 2,
        "price": 120
      }
    ]
  }
}
```

### Get Cart
**Method and URL:** `GET /api/cart/get-cart`
**Authentication:** Authenticated user
**Success Response:** `200 OK`
```json
{
  "message": "Cart fetched successfully",
  "items": [
    {
      "menuItem": {
        "_id": "64c8f...",
        "name": "Cappuccino"
      },
      "quantity": 2,
      "price": 120,
      "itemTotal": 240
    }
  ],
  "cart": {
    "_id": "64d...",
    "user": "64c8f...",
    "items": [...]
  }
}
```

### Update Cart
**Method and URL:** `PATCH /api/cart/update-cart/:menuItemId`
**Authentication:** Authenticated user
**Path Parameters:**
- `menuItemId` (String): The ID of the menu item in the cart.
**Request Body:**
```json
{
  "quantity": 3 // Required: 1 or more
}
```
**Success Response:** `200 OK`
```json
{
  "message": "Cart item updated successfully",
  "cart": { ... }
}
```

### Remove from Cart
**Method and URL:** `DELETE /api/cart/remove-cart/:menuItemId`
**Authentication:** Authenticated user
**Path Parameters:**
- `menuItemId` (String): The ID of the menu item to remove.
**Success Response:** `200 OK`
```json
{
  "message": "Cart item removed successfully",
  "cart": { ... }
}
```

### Clear Cart
**Method and URL:** `DELETE /api/cart/clear`
**Authentication:** Authenticated user
**Success Response:** `200 OK`
```json
{
  "message": "Cart cleared successfully"
}
```

---

## Time Slots

*Note: The routes are mapped to both `/api/timeslot` and `/api/time-slots`. Use `/api/time-slots` as the preferred standard REST plural convention.*

### Create Time Slot
**Method and URL:** `POST /api/time-slots/timeslot`
**Authentication:** Admin only
**Request Body:**
```json
{
  "date": "2026-09-15",   // Required: YYYY-MM-DD
  "startTime": "09:00",   // Required: HH:mm
  "endTime": "10:00",     // Required: HH:mm
  "maxOrders": 20         // Required: Positive Integer
}
```
**Success Response:** `201 Created`
```json
{
  "message": "Time slot created successfully",
  "timeSlot": {
    "_id": "64e...",
    "date": "2026-09-15T00:00:00.000Z",
    "startTime": "09:00",
    "endTime": "10:00",
    "maxOrders": 20,
    "currentOrders": 0,
    "isActive": true
  }
}
```

### Get Time Slots
**Method and URL:** `GET /api/time-slots/`
**Authentication:** Authenticated user
**Query Parameters:**
- `date` (String, Required): Format `YYYY-MM-DD`.
**Success Response:** `200 OK`
```json
{
  "message": "Time slots fetched successfully",
  "timeSlots": [
    {
      "_id": "64e...",
      "date": "2026-09-15T00:00:00.000Z",
      "startTime": "09:00",
      "endTime": "10:00",
      "maxOrders": 20,
      "currentOrders": 5,
      "isActive": true,
      "availableOrders": 15
    }
  ]
}
```

### Update Time Slot
**Method and URL:** `PATCH /api/time-slots/:id`
**Authentication:** Admin only
**Path Parameters:**
- `id` (String): The ID of the time slot to update.
**Request Body:** (All optional)
```json
{
  "maxOrders": 30,
  "isActive": false
}
```
**Success Response:** `200 OK`
```json
{
  "message": "Time slot updated successfully",
  "timeSlot": { ... }
}
```

### Deactivate Time Slot
**Method and URL:** `PATCH /api/time-slots/:id/deactivate`
**Authentication:** Admin only
**Path Parameters:**
- `id` (String): The ID of the time slot.
**Success Response:** `200 OK`
```json
{
  "message": "Time slot deactivated successfully",
  "timeSlot": { ... }
}
```

---

## Orders

### Customer

#### Create Order
**Method and URL:** `POST /api/orders/`
**Authentication:** Authenticated user
**Request Body:**
```json
{
  "timeSlotId": "64e..." // Required: ID of the selected Time Slot
}
```
**Success Response:** `201 Created`
```json
{
  "message": "Order created successfully",
  "order": {
    "_id": "64f...",
    "user": "64c...",
    "items": [
      {
        "menuItem": "64m...",
        "name": "Cappuccino",
        "price": 120,
        "quantity": 2
      }
    ],
    "timeSlot": "64e...",
    "totalAmount": 240,
    "orderStatus": "PENDING",
    "paymentStatus": "PENDING"
  }
}
```

#### Get My Orders
**Method and URL:** `GET /api/orders/`
**Authentication:** Authenticated user
**Success Response:** `200 OK`
```json
{
  "message": "Orders fetched successfully",
  "orders": [
    {
      "_id": "64f...",
      "orderStatus": "PENDING",
      "totalAmount": 240
    }
  ]
}
```

#### Get Order By ID
**Method and URL:** `GET /api/orders/:id`
**Authentication:** Authenticated user
**Path Parameters:**
- `id` (String): Order ID.
**Success Response:** `200 OK`
```json
{
  "message": "Order fetched successfully",
  "order": {
    "_id": "64f...",
    "orderStatus": "PENDING",
    "totalAmount": 240
  }
}
```

#### Cancel Order
**Method and URL:** `PATCH /api/orders/:id/cancel`
**Authentication:** Authenticated user
**Path Parameters:**
- `id` (String): Order ID.
**Success Response:** `200 OK`
```json
{
  "message": "Order cancelled successfully",
  "order": {
    "_id": "64f...",
    "orderStatus": "CANCELLED"
  }
}
```

### Admin

#### Get All Orders
**Method and URL:** `GET /api/orders/admin/all`
**Authentication:** Admin only
**Success Response:** `200 OK`
```json
{
  "message": "All orders fetched successfully",
  "orders": [
    {
      "_id": "64f...",
      "user": {
        "_id": "64c...",
        "name": "John Doe",
        "email": "user@example.com"
      },
      "orderStatus": "COMPLETED"
    }
  ]
}
```

#### Get Order By ID (Admin)
**Method and URL:** `GET /api/orders/admin/:id`
**Authentication:** Admin only
**Path Parameters:**
- `id` (String): Order ID.
**Success Response:** `200 OK`
```json
{
  "message": "Order fetched successfully",
  "order": {
    "_id": "64f...",
    "user": {
      "_id": "64c...",
      "name": "John Doe",
      "email": "user@example.com",
      "phone": "1234567890"
    }
  }
}
```

#### Update Order Status
**Method and URL:** `PATCH /api/orders/admin/:id/status`
**Authentication:** Admin only
**Path Parameters:**
- `id` (String): Order ID.
**Request Body:**
```json
{
  "status": "COMPLETED" // Required. Valid: PENDING, CONFIRMED, PREPARING, READY, COMPLETED, CANCELLED
}
```
**Success Response:** `200 OK`
```json
{
  "message": "Order status updated successfully",
  "order": { ... }
}
```

---

## Payments

**Frontend Flow:**
1. Create a CafeQ Order (`POST /api/orders/`) to get the CafeQ `orderId`.
2. Create a Razorpay Payment Order (`POST /api/payment/createpaymentorder`) using the CafeQ `orderId`.
3. Open Razorpay Checkout using the returned Razorpay `orderId`.
4. Verify the Razorpay Payment (`POST /api/payment/verifypayment`) on successful checkout.

### Create Razorpay Payment Order
**Method and URL:** `POST /api/payment/createpaymentorder`
**Authentication:** Authenticated user
**Request Body:**
```json
{
  "orderId": "64f..." // Required: The CafeQ internal Order ID
}
```
**Success Response:** `200 OK`
```json
{
  "message": "Payment order created successfully",
  "orderId": "order_XXXXXX", // The Razorpay specific order ID
  "amount": 24000,           // Amount in paise
  "currency": "INR"
}
```

### Verify Razorpay Payment
**Method and URL:** `POST /api/payment/verifypayment`
**Authentication:** Authenticated user
**Request Body:**
```json
{
  "razorpay_order_id": "order_XXXX",   // Required
  "razorpay_payment_id": "pay_XXXX",   // Required
  "razorpay_signature": "ab12..."      // Required
}
```
**Success Response:** `200 OK`
```json
{
  "message": "Payment verified and order marked as PAID"
}
```

---

## Reviews

### Create Review
**Method and URL:** `POST /api/reviews/`
**Authentication:** Authenticated user
**Request Body:**
```json
{
  "orderId": "64f...",      // Required
  "menuItemId": "64m...",   // Required
  "rating": 5,              // Required: 1 to 5
  "comment": "Great!"       // Optional
}
```
**Success Response:** `201 Created`
```json
{
  "message": "Review created successfully",
  "review": {
    "_id": "64r...",
    "rating": 5,
    "comment": "Great!"
  }
}
```

### Get Reviews
**Method and URL:** `GET /api/reviews/:menuItemId`
**Authentication:** Public / Authenticated user (Middleware not strict on GET)
**Path Parameters:**
- `menuItemId` (String): The ID of the menu item.
**Success Response:** `200 OK`
```json
{
  "reviews": [
    {
      "_id": "64r...",
      "user": { "_id": "64c...", "name": "John Doe" },
      "rating": 5,
      "comment": "Great!"
    }
  ]
}
```

### Update Review
**Method and URL:** `PUT /api/reviews/:reviewId`
**Authentication:** Authenticated user
**Path Parameters:**
- `reviewId` (String): The ID of the review.
**Request Body:** (Partial updates supported)
```json
{
  "rating": 4,
  "comment": "Good!"
}
```
**Success Response:** `200 OK`
```json
{
  "message": "Review updated successfully",
  "review": { ... }
}
```

### Delete Review
**Method and URL:** `DELETE /api/reviews/:reviewId`
**Authentication:** Authenticated user
**Path Parameters:**
- `reviewId` (String): The ID of the review.
**Success Response:** `200 OK`
```json
{
  "message": "Review deleted successfully"
}
```

### Get Average Rating
**Method and URL:** `GET /api/reviews/average/:menuItemId`
**Authentication:** Public / Authenticated user
**Path Parameters:**
- `menuItemId` (String): The ID of the menu item.
**Success Response:** `200 OK`
```json
{
  "averageRating": 4.5,
  "totalReviews": 10
}
```

---

## Recommendations

### Get Recommendations
**Method and URL:** `POST /api/recommendations/`
**Authentication:** Authenticated user
**Request Body:** (All Optional)
```json
{
  "menuItems": ["64m...", "64m2..."],    // Array of menu item IDs in the current context (e.g. cart)
  "minimumSupport": 0.5,
  "minimumConfidence": 0.5,
  "minimumLift": 1.0,
  "rebuyWeight": 0.3,
  "temporalWeight": 0.2,
  "referenceDate": "2026-09-12T00:00:00Z"
}
```
**Success Response:** `200 OK`
```json
{
  "recommendations": [
    {
      "menuItem": {
        "_id": "64m3...",
        "name": "Chocolate Cake",
        "price": 150
      },
      "score": 0.85
    }
  ]
}
```

---

## Inventory

### Admin

#### Get Inventory
**Method and URL:** `GET /api/inventory/`
**Authentication:** Admin only
**Success Response:** `200 OK`
```json
{
  "message": "Inventory fetched successfully",
  "inventories": [
    {
      "_id": "64i...",
      "menuItem": { "_id": "64m...", "name": "Cappuccino" },
      "quantity": 50,
      "minimumStock": 10
    }
  ]
}
```

#### Add Inventory
**Method and URL:** `POST /api/inventory/`
**Authentication:** Admin only
**Request Body:**
```json
{
  "menuItem": "64m...", // Required
  "quantity": 50,       // Optional (Defaults to 0)
  "minimumStock": 10    // Optional (Defaults to 5)
}
```
**Success Response:** `201 Created`
```json
{
  "message": "Inventory created successfully",
  "inventory": { ... }
}
```

#### Update Inventory
**Method and URL:** `PATCH /api/inventory/:id`
**Authentication:** Admin only
**Path Parameters:**
- `id` (String): Inventory Item ID.
**Request Body:** (Partial updates supported)
```json
{
  "quantity": 60,
  "minimumStock": 15
}
```
**Success Response:** `200 OK`
```json
{
  "message": "Inventory updated successfully",
  "inventory": { ... }
}
```

#### Get All Inventory
**Method and URL:** `GET /api/inventory/all`
**Authentication:** Admin only
**Success Response:** `200 OK`
```json
{
  "message": "Inventory fetched successfully",
  "inventories": [ ... ]
}
```

#### Add Stock
**Method and URL:** `POST /api/inventory/add-stock`
**Authentication:** Admin only
**Request Body:**
```json
{
  "menuItem": "64m...", // Required
  "quantity": 20        // Required
}
```
**Success Response:** `200 OK`
```json
{
  "message": "Stock added successfully",
  "inventory": { ... }
}
```

#### Update Stock
**Method and URL:** `PUT /api/inventory/update-stock`
**Authentication:** Admin only
**Request Body:**
```json
{
  "menuItem": "64m...", // Required
  "quantity": 20        // Required (Sets stock to this exact value)
}
```
**Success Response:** `200 OK`
```json
{
  "message": "Stock updated successfully",
  "inventory": { ... }
}
```

#### Get Low Stock Items
**Method and URL:** `GET /api/inventory/low-stock`
**Authentication:** Admin only
**Success Response:** `200 OK`
```json
{
  "message": "Low stock items fetched successfully",
  "inventories": [ ... ]
}
```

---

## Admin Analytics

### Get Dashboard Analytics
**Method and URL:** `GET /api/admin/dashboard`
**Authentication:** Admin only
**Query Parameters:**
- `from` (Date String, Optional): Filter orders created on or after this date (e.g., `2026-09-01`).
- `to` (Date String, Optional): Filter orders created on or before this date (e.g., `2026-09-30`).

**Success Response:** `200 OK`
```json
{
  "summary": {
    "totalOrders": 120,
    "pendingOrders": 10,
    "completedOrders": 100,
    "cancelledOrders": 10,
    "paidOrders": 110,
    "totalRevenue": 25000
  },
  "inventory": {
    "totalItems": 45,
    "lowStockItems": 5,
    "outOfStockItems": 2
  },
  "topMenuItems": [
    { "name": "Latte", "quantity": 150 }
  ],
  "ordersByStatus": [
    { "status": "COMPLETED", "count": 100 },
    { "status": "PENDING", "count": 10 }
  ],
  "revenueByDate": [
    { "date": "2026-09-12", "totalRevenue": 1500 }
  ]
}
```

### Error Responses
**400 Bad Request:**
```json
{
  "message": "from date cannot be after to date"
}
```

---

## Notes
- **Authentication:** Ensure you send the `token` cookie or `Authorization: Bearer <token>` in the header for protected routes. CORS is configured to accept credentials (`credentials: true`).
- **Route Aliases:** For timeslots, both `/api/timeslot` and `/api/time-slots` exist due to legacy routing. `/api/time-slots` is preferred for standard REST mapping. Similarly, `POST /api/menu/menu` uses a redundant path segment; be careful with base URLs.
- **Order Status Values:** `PENDING`, `CONFIRMED`, `PREPARING`, `READY`, `COMPLETED`, `CANCELLED`
- **Payment Status Values:** `PENDING`, `PAID`, `FAILED`
- **Role Security:** The backend explicitly strips `role` from the `POST /api/auth/register` payload, forcing all new accounts to default to `CUSTOMER` to prevent privilege escalation.
