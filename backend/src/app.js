const express=require('express')
const authRoutes=require('./routes/auth.routes')
const menuRoutes=require('./routes/menu.routes')
const cartRoutes=require('./routes/cart.routes')
const timeSlotRoutes=require('./routes/timeSlot.routes')
const orderRoutes=require('./routes/order.routes')
const inventoryRoutes=require('./routes/inventory.routes')
const paymentRoutes=require('./routes/payment.routes')
const reviewRoutes=require('./routes/review.routes')
const recommendationRoutes=require('./routes/recommendation.routes')
const adminRoutes=require('./routes/admin.routes')
const cookieParser=require('cookie-parser')
const cors=require('cors');
const app=express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
	origin:'http://localhost:5173',
	credentials:true
}));
app.use('/api/auth', authRoutes);
app.use('/api/menu',menuRoutes);
app.use('/api/cart',cartRoutes);
app.use('/api/timeslot',timeSlotRoutes)
app.use('/api/time-slots',timeSlotRoutes)
app.use('/api/orders',orderRoutes)
app.use('/api/inventory',inventoryRoutes)
app.use('/api/payment',paymentRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/recommendations', recommendationRoutes)
app.use('/api/admin', adminRoutes)

module.exports=app;