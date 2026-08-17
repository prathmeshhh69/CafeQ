const mongoose=require('mongoose')

const timeSlotSchema= new mongoose.Schema({
  date:{
    type:Date,
    required:true
  },
  startTime:{
    type:String,
    required:true
  },
  endTime:{
    type:String,
    required:true
  },
  maxOrders:{
    type:Number,
    required:true
  },
  currentOrders:{
    type:Number,
    default:0
  },
  isActive:{
    type:Boolean,
    default:true
  }
})

const timeSlotModel=mongoose.model('TimeSlot',timeSlotSchema)

module.exports=timeSlotModel;