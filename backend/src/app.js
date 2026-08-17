const express=require('express')
const authRoutes=require('./routes/auth.routes')
const menuRoutes=require('./routes/menu.routes')
const cartRoutes=require('./routes/cart.routes')
const timeSlotRoutes=require('./routes/timeSlot.routes')
const orderRoutes=require('./routes/order.routes')
const inventoryRoutes=require('./routes/inventory.routes')
const cookieParser=require('cookie-parser')
const app=express();
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/menu',menuRoutes);
app.use('/api/cart',cartRoutes);
app.use('/api/timeslot',timeSlotRoutes)
app.use('/api/time-slots',timeSlotRoutes)
app.use('/api/orders',orderRoutes)
app.use('/api/inventory',inventoryRoutes)

module.exports=app;