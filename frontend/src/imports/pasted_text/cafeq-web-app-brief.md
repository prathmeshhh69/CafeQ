Create a complete responsive WEB APP frontend for a project called “CafeQ”.

IMPORTANT:
This is a desktop-first responsive web application, NOT a mobile app and NOT a Swiggy/Zomato-style marketplace.

I am attaching a visual reference image. Use that image as the main inspiration for the visual identity: warm cream backgrounds, lime-yellow accents, hand-drawn typography, playful doodles, food photography, rounded cards, friendly illustrations, and a youthful local-café personality.

Do NOT copy the mobile layouts literally. Translate the visual language into a polished responsive WEB interface.

==================================================
1. PRODUCT CONCEPT
==================================================

CafeQ is a pre-order and pickup platform for ONE café.

The purpose is:

Browse menu
→ add food to cart
→ receive relevant food recommendations
→ choose a pickup date and time slot
→ place the order
→ pay online
→ track preparation status
→ collect food from the café
→ optionally review ordered items.

This is NOT a delivery application.

Do not create:
- restaurant discovery
- nearby restaurants
- maps
- delivery addresses
- drivers
- delivery tracking
- favourites
- saved cards
- social login
- admin registration

The application has two roles:

1. CUSTOMER
2. ADMIN

Design both under the same CafeQ brand, but make the customer interface playful and the admin interface more formal and operational.

==================================================
2. MAIN GOAL FOR THIS FIGMA MAKE GENERATION
==================================================

Prioritize DESIGN QUALITY and reusable frontend components.

Do not spend excessive effort building complicated backend logic.

Create a polished, responsive, clickable frontend using realistic mock data and interactions.

Structure the UI so that the real backend can be connected later without redesigning the application.

The most important output is:

- strong visual system
- reusable components
- responsive layouts
- all important customer screens
- essential admin screens
- loading states
- empty states
- error states
- realistic interactions

==================================================
3. VISUAL DIRECTION
==================================================

Use the attached reference image as inspiration.

The personality should feel:

- warm
- charming
- youthful
- handcrafted
- local
- energetic
- slightly quirky
- clean enough to feel professionally designed

The result must NOT look like:
- a generic SaaS dashboard
- a bootstrap template
- a shadcn default project
- a Swiggy/Zomato clone
- a giant mobile application stretched across desktop

Think:

“Friendly neighbourhood café + hand-drawn notebook illustrations + polished modern web UI.”

==================================================
4. COLOR SYSTEM
==================================================

Use approximately this palette:

Main background:
#FFF8E8

Secondary surface:
#FFFDF5

Primary lime/yellow:
#E5EE58

Dark ink:
#181817

Orange accent:
#FFAA32

Warm red accent:
#FF625C

Soft green:
#A8B968

Muted text:
#6F6A5F

Border:
#E7DDC8

Success:
muted natural green

Error:
soft warm red

Do NOT make the whole interface yellow.

Use the lime primarily for:
- primary buttons
- selected tabs
- active category pills
- small highlights
- badges
- important CTAs

==================================================
5. TYPOGRAPHY
==================================================

Use two font personalities.

HEADLINES:
A readable handwritten / marker-style font similar to:
- Kalam
- Patrick Hand
- another hand-drawn equivalent

Use it for:
- hero headings
- section titles
- fun messages
- decorative phrases

BODY / FUNCTIONAL UI:
Use Inter or a similarly clean sans-serif.

Use the sans-serif font for:
- navigation
- forms
- prices
- product information
- tables
- buttons
- admin UI
- long text

Do not use handwritten typography for everything.

==================================================
6. ILLUSTRATION STYLE
==================================================

Use sparse hand-drawn doodles inspired by the reference image:

- stars
- sparkles
- little hearts
- steam
- cups
- forks/spoons
- tiny arrows
- smiley faces
- small food characters
- abstract strokes

Use mostly:
black, yellow, orange and occasional red.

Do NOT overload the interface with doodles.

They should add personality without hurting readability.

==================================================
7. WEB LAYOUT SYSTEM
==================================================

Desktop target:
1440px wide.

Main content maximum width:
approximately 1200–1280px.

Use generous whitespace.

Use a responsive grid.

Desktop menu:
3–4 product cards per row.

Tablet:
2 cards per row.

Mobile:
1 or compact 2-column layout depending on width.

Use:

Large card radius:
20–24px

Normal card radius:
14–18px

Buttons:
12–16px radius

Filter chips:
pill shaped

Prefer subtle 1px borders over strong drop shadows.

Avoid putting absolutely everything inside a card.

==================================================
8. GLOBAL CUSTOMER NAVIGATION
==================================================

Create a sticky desktop navbar.

LEFT:
CafeQ logo

CENTRE:
Menu
My Orders

RIGHT:
Search icon if useful
Cart icon with quantity badge
User avatar / name

User menu:
My Orders
Account
Logout

Use a cream translucent navbar with a subtle bottom border.

For mobile:

Use compact top header plus bottom navigation.

Bottom navigation:
Menu
Cart
Orders
Profile

==================================================
9. LANDING / MENU HOME PAGE
==================================================

The main page after login is the MENU.

Do not create a restaurant discovery page.

Create a visually strong hero section.

LEFT SIDE:

Large handwritten heading:

“Hungry? Let’s fix that.”

Supporting text:

“Fresh favourites, ready when you are.”

Large search field:

“Search dishes, drinks, desserts…”

Primary CTA may be:

“Explore Menu”

RIGHT SIDE:

A playful food illustration or high-quality café food photography composition with small hand-drawn doodles around it.

Below the hero:

Create category pills.

Examples:

All
Coffee
Beverages
Snacks
Sandwiches
Desserts

Selected category:
lime background + dark text.

Then show:

“Popular Picks”

and

“Explore the Menu”

==================================================
10. MENU PRODUCT CARDS
==================================================

Create a reusable FoodCard component.

Each product card should contain:

- large appetising image
- category label
- item name
- short description
- rating
- review count
- price in ₹
- add button

Example:

Cappuccino

Rich espresso with creamy steamed milk.

★ 4.6 · 23 reviews

₹120

[ + Add ]

Make food imagery visually important.

Do not create tiny generic e-commerce cards.

Cards should feel tactile and café-like.

When an item is already in cart:

replace Add with a compact quantity control where appropriate:

[ − ] 2 [ + ]

Unavailable items:

- slightly desaturate image
- show “Currently unavailable”
- disable Add button

==================================================
11. SEARCH AND FILTERING
==================================================

Create search and filtering states.

Search supports item name and description.

Provide:

- search input
- category pills
- clear-search control
- pagination
- loading skeleton
- no-results state

No results message:

“Nothing tasty matched that search.”

Supporting text:

“Try another dish or category.”

==================================================
12. PRODUCT DETAILS
==================================================

Clicking a menu item should open a polished product details experience.

Desktop:
large modal or side panel.

Mobile:
full-page view.

Show:

- large food image
- name
- category
- description
- price
- average rating
- number of reviews
- quantity control
- Add to Cart button

Below:

Customer Reviews

Review card should contain:
- customer name
- star rating
- comment

Empty reviews:

“No reviews yet.”

“Be the first after trying it!”

==================================================
13. LOGIN PAGE
==================================================

Create a beautiful split-screen desktop login page.

LEFT:
CafeQ branding
large illustration
playful doodles

Headline:

“Good food. Better moods.”

RIGHT:
login form

Heading:

“Welcome back!”

Fields:

Email or Phone Number
Password

Primary button:

Log In

Secondary text:

“New here? Create an account”

Do NOT add:
Google login
Apple login
OTP
Forgot password

unless a backend API exists later.

==================================================
14. REGISTER PAGE
==================================================

Use the same visual identity.

Heading:

“Join the CafeQ family!”

Fields:

Full Name
Email Address
Phone Number
Password

Primary CTA:

Create Account

Secondary link:

“Already have an account? Log in”

IMPORTANT:
There is NO role selector.

All public registrations are CUSTOMER accounts.

Do not create:
“Register as Admin”

==================================================
15. CART PAGE
==================================================

Create a desktop `/cart` page.

Layout:

LEFT approximately 65%
cart items

RIGHT approximately 35%
sticky order summary

Each item contains:

- thumbnail
- product name
- price
- quantity stepper
- line total
- remove button

Example:

Cappuccino
₹120

[ − ] 2 [ + ]

₹240

Remove

Order summary:

Subtotal
Total

Do NOT show:
delivery fee
delivery address
shipping

This is PICKUP.

Primary CTA:

“Choose Pickup Time”

==================================================
16. RECOMMENDATION SECTION
==================================================

Below the cart items create a visually attractive recommendation area.

Heading:

“Complete your meal”

Handwritten subtext:

“These go pretty well together 👀”

Show 3–4 recommendation cards horizontally.

Each:

image
name
price
Add button

Do NOT display:
machine learning score
support
confidence
lift
internal recommendation variables

The customer only needs to see recommended food.

==================================================
17. EMPTY CART
==================================================

Design a memorable empty state.

Use a small hand-drawn empty plate/cup illustration.

Headline:

“Your cart looks hungry.”

Supporting copy:

“Add something delicious from the menu.”

Button:

“Browse Menu”

==================================================
18. CHECKOUT PAGE
==================================================

This application uses PICKUP TIME SLOTS.

Do NOT ask for a delivery address.

Create a desktop checkout layout with:

LEFT:
pickup scheduling

RIGHT:
sticky order summary

==================================================
19. PICKUP DATE AND TIME
==================================================

Section heading:

“When should we have it ready?”

Allow customer to select a date.

After selecting a date, show available time slots.

Example:

12:00 PM – 12:30 PM

12:30 PM – 1:00 PM

1:00 PM – 1:30 PM

1:30 PM – 2:00 PM

Display slots as attractive selectable cards/pills.

Selected slot:
lime accent.

Full / inactive slot:
disabled and visibly unavailable.

Show subtle capacity feedback if useful, for example:

“Few slots left”

Do not expose unnecessary technical values.

==================================================
20. CHECKOUT ORDER SUMMARY
==================================================

Show:

item
quantity
price

Subtotal
Final Total

Then:

Payment Method

Online Payment

Secure payment powered by Razorpay

Primary CTA:

“Pay & Place Order”

Make the button large and visually dominant.

Do NOT show Cash on Delivery.

==================================================
21. PAYMENT STATES
==================================================

Design these states:

Processing payment

Payment successful

Payment cancelled

Payment failed

Do not show a successful order confirmation before payment verification succeeds.

Failed state:

“Payment didn’t go through.”

Button:

“Try Again”

==================================================
22. ORDER CONFIRMATION
==================================================

After successful payment:

Create a joyful confirmation page.

Large hand-drawn food/cup illustration.

Heading:

“Order confirmed!”

Supporting message:

“We’re getting it ready for you.”

Show a compact card containing:

Order number
Pickup time
Total amount
Payment status

Primary CTA:

“Track Order”

Secondary CTA:

“View Order Details”

Use celebratory doodles without overdoing them.

==================================================
23. ORDER TRACKING
==================================================

Create `/orders/:id`.

Order states are:

PENDING
CONFIRMED
PREPARING
READY
COMPLETED
CANCELLED

Create a beautiful progress timeline.

Desktop:
horizontal.

Mobile:
vertical.

Readable labels:

Order Placed
Confirmed
Preparing
Ready for Pickup
Completed

PREPARING state:

Headline:

“Cooking with love!”

Supporting message:

“Your food is being prepared.”

Use a playful cooking illustration.

READY state must be visually prominent.

Headline:

“Your order is ready! 🎉”

Supporting copy:

“You can head over and pick it up.”

Do NOT create maps or driver tracking.

==================================================
24. ORDER DETAILS
==================================================

Below or beside tracking show:

Order ID
Order status
Payment status
Pickup slot
Items
Quantity
Price
Total

If cancellation is allowed, show:

Cancel Order

Make it secondary / destructive.

Clicking it opens confirmation modal:

“Cancel this order?”

Buttons:

Keep Order
Cancel Order

Never cancel from one accidental click.

==================================================
25. MY ORDERS PAGE
==================================================

Create `/orders`.

Heading:

“My Orders”

Tabs:

Active Orders
Past Orders

Active:
Pending
Confirmed
Preparing
Ready

Past:
Completed
Cancelled

Each order card should contain:

- order ID
- products
- small food thumbnails
- total amount
- order status
- payment status
- View Order button

Use clear status badges.

==================================================
26. REVIEWS
==================================================

After COMPLETED orders, allow customers to review food items.

Create:

“Rate your order”

For each eligible item:

1–5 star selector

Optional comment input

Submit Review

Existing reviews belonging to the current user can show:

Edit
Delete

Delete requires confirmation.

Do not show rating prompts before order completion.

==================================================
27. ACCOUNT PAGE
==================================================

Create a simple friendly `/account` page.

Show:

Name
Email
Phone
Role
Verification status if useful

Provide shortcuts:

My Orders
Logout

Do NOT create:

Saved addresses
Saved cards
profile editing

unless backend functionality is later added.

==================================================
28. ADMIN EXPERIENCE
==================================================

Create a separate `/admin` area.

The admin design should use the SAME CafeQ brand but be noticeably more professional.

Customer:
playful.

Admin:
clean, calm and operational.

Reduce doodles significantly.

Use:
cream / white surfaces
dark text
lime accent
clear tables
structured spacing
sans-serif typography

Think:

“Cafe manager dashboard, but still unmistakably CafeQ.”

==================================================
29. ADMIN SIDEBAR
==================================================

Desktop sidebar:

CafeQ logo

Dashboard
Orders
Menu
Inventory
Pickup Slots

Bottom:

Admin profile
Logout

Use icons.

Sidebar may collapse on smaller screens.

==================================================
30. ADMIN DASHBOARD
==================================================

Create an analytics dashboard.

Header:

“Good morning, Admin”

Include date filtering:

From
To

Create summary metric cards:

Total Orders
Pending Orders
Completed Orders
Cancelled Orders
Paid Orders
Total Revenue

Inventory cards:

Total Items
Low Stock
Out of Stock

Charts:

Revenue Over Time

Orders by Status

Best Selling Items

Use clean data visualisation.

Do not add decorative charts just for appearance.

==================================================
31. ADMIN ORDER MANAGEMENT
==================================================

Create `/admin/orders`.

Use an operational table.

Columns:

Order ID
Customer
Amount
Payment
Status
Action

Filters:

All
Pending
Confirmed
Preparing
Ready
Completed
Cancelled

Order details should open in a side panel or dedicated page.

Show:

Customer name
Email
Phone
Items
Quantities
Total
Payment Status
Order Status

Provide clear workflow buttons.

Examples:

Pending → Confirm Order

Confirmed → Start Preparing

Preparing → Mark Ready

Ready → Mark Completed

Cancelled requires confirmation.

==================================================
32. MENU MANAGEMENT
==================================================

Create `/admin/menu`.

Header:

“Menu Management”

Primary CTA:

“+ Add Menu Item”

Table/grid:

Image
Name
Category
Price
Availability
Actions

Create/edit modal:

Name
Description
Price
Category
Image URL
Available toggle

Actions:

Edit
Mark unavailable
Delete

Deletion must require confirmation.

Prefer marking items unavailable instead of deleting them when temporarily unavailable.

==================================================
33. INVENTORY MANAGEMENT
==================================================

Create `/admin/inventory`.

Top cards:

Total Items
Low Stock
Out of Stock

Filters:

All Inventory
Low Stock

Table:

Product
Current Stock
Minimum Stock
Stock Health
Actions

Stock states:

Healthy
Low Stock
Out of Stock

Create actions:

Add Stock
Set Stock
Edit Minimum Stock

IMPORTANT:

Clearly distinguish:

“Add Stock”
increments current stock.

“Set Stock”
replaces the stock quantity.

Make them visually different enough that an admin cannot confuse them.

==================================================
34. PICKUP SLOT MANAGEMENT
==================================================

Create `/admin/time-slots`.

Add date selector.

Show time slots in rows/cards.

Each shows:

Start Time
End Time
Current Orders
Maximum Orders
Remaining Capacity
Active / Inactive

Example:

12 / 20 orders

Show a small capacity progress indicator.

Primary CTA:

“+ Create Time Slot”

Creation form:

Date
Start Time
End Time
Maximum Orders

Allow admins to:

Edit slot
Deactivate slot

Do not treat deactivation as deletion.

==================================================
35. STATUS SYSTEM
==================================================

Create reusable StatusBadge components.

Order states:

PENDING
CONFIRMED
PREPARING
READY
COMPLETED
CANCELLED

Payment states:

PENDING
PAID
FAILED

Use consistent colors everywhere.

Never communicate state using colour alone.

Always include text.

==================================================
36. LOADING STATES
==================================================

Create skeleton loaders for:

- menu cards
- cart
- order list
- dashboard metrics
- tables

Do not leave blank screens while data loads.

Buttons performing actions should show a loading state and temporarily disable duplicate clicks.

==================================================
37. ERROR STATES
==================================================

Use friendly toast notifications.

Examples:

Success:

“Added to your cart!”

“Order updated.”

“Payment successful!”

“Review submitted.”

Errors:

“Something went wrong. Please try again.”

“Couldn’t add that item.”

“Unable to load your orders.”

“No pickup slots are available for this date.”

Keep error messages useful and calm.

==================================================
38. EMPTY STATES
==================================================

Design custom empty states instead of generic text.

No orders:

“No orders yet.”

“Your first favourite is waiting.”

No menu results:

“Nothing tasty matched that search.”

No pickup slots:

“No pickup slots left for this date.”

“Try another day.”

No reviews:

“No reviews yet.”

No low-stock items:

“All stocked up!”

==================================================
39. RESPONSIVE DESIGN
==================================================

DESKTOP >= 1200px:

full navbar
wide layouts
3–4 column menu grid
side-by-side checkout
horizontal tracking timeline
admin sidebar

TABLET 768–1199px:

2-column menu
reduced margins
collapsible admin sidebar
stack selected page sections when appropriate

MOBILE < 768px:

compact header
customer bottom navigation
single-column layouts
sticky primary CTAs
vertical order timeline
cards instead of very wide admin tables

Do NOT design desktop pages as giant phone screens.

==================================================
40. REUSABLE COMPONENTS
==================================================

Build and reuse components such as:

Navbar
MobileBottomNav
AdminSidebar

Button
Input
SearchInput
PasswordInput

FoodCard
CategoryChip
QuantityStepper

CartItem
CartSummary
RecommendationCard

PickupDateSelector
PickupTimeSlot

StatusBadge
PaymentBadge

OrderCard
OrderTimeline

ReviewCard
RatingInput

Toast
Modal
ConfirmationModal

EmptyState
Skeleton

AdminMetricCard
AdminTable
InventoryBadge

Reuse the same design tokens throughout the application.

==================================================
41. BACKEND-AWARE UI RULES
==================================================

The real backend supports:

Authentication
Menu
Cart
Pickup Time Slots
Orders
Razorpay payments
Reviews
Recommendations
Inventory
Admin analytics

Therefore design the frontend around these capabilities only.

Authentication supports:

Register using:
name
email
phone
password

Login using either:

email + password

OR

phone + password.

All public registrations are CUSTOMER accounts.

The menu supports:

category filtering
search
availability filtering
pagination

The cart supports:

add item
change quantity
remove item
clear cart

Checkout requires selecting a pickup time slot.

Orders use these statuses:

PENDING
CONFIRMED
PREPARING
READY
COMPLETED
CANCELLED

Payments use:

PENDING
PAID
FAILED

Recommendations can be based on products currently in the cart.

Reviews support:

view
create
edit
delete

Admin supports:

orders
menu management
inventory
pickup slot management
analytics

==================================================
42. DO NOT INVENT FEATURES
==================================================

Do NOT create functional UI for:

Restaurant discovery
Multiple restaurants
Nearby cafés
Location tracking
Maps
Delivery
Delivery addresses
Delivery drivers
Saved addresses
Saved payment cards
Wishlist
Favourites
Social login
Password reset
Admin signup
Customer profile editing

The reference image may contain some patterns related to restaurant discovery or addresses.

Ignore those parts.

Take ONLY the visual style from the reference image.

CafeQ is a SINGLE-CAFÉ PICKUP SYSTEM.

==================================================
43. MICROCOPY
==================================================

Use occasional playful phrases:

“Hungry? Let’s fix that.”

“Good food. Better moods.”

“Complete your meal.”

“Your cart looks hungry.”

“Cooking with love.”

“Almost ready!”

“Your order is ready!”

“Fresh favourites, ready when you are.”

Use playful copy selectively.

Functional information must remain clear.

Admin copy should be straightforward and professional.

==================================================
44. FINAL DESIGN QUALITY
==================================================

Do not produce a generic AI-generated collection of cards.

The finished product should feel intentionally art-directed.

Priorities:

1. Excellent visual identity
2. Clear customer flow
3. Responsive web layout
4. Strong reusable components
5. Backend-compatible screens
6. Good usability
7. Distinctive CafeQ personality
8. Thoughtful empty/loading/error states
9. Professional admin UX

The customer website should feel memorable, playful and food-focused.

The admin interface should feel efficient, clear and reliable.

Both should visibly belong to the same CafeQ brand.

Use the attached reference image heavily for visual inspiration, but redesign everything appropriately for a modern responsive WEB application.