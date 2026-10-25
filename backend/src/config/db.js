const mongoose=require('mongoose');
const dns=require('dns')
dns.setServers([
    '1.1.1.1',
    '8.8.8.8'
])
async function connectDB(){
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected')   
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

module.exports=connectDB;