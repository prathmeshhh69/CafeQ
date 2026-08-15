const express=require('express')
const authRoutes=require('./routes/auth.routes')
const menuRoutes=require('./routes/menu.routes')
const cartRoutes=require('./routes/cart.routes')
const cookieParser=require('cookie-parser')
const app=express();
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/menu',menuRoutes);
app.use('/api/cart',cartRoutes);

module.exports=app;