//which property?
//which user
//pric
//dates
//guests
//paid

import mongoose from "mongoose";
const bookingSchema = new mongoose.Schema({
    property:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Property",
        required:[true,"Booking must belong to a property"]
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:[true,"Booking must belong to a user"]
    },
    price:{
        type:Number,
        required:[true,"Booking must have a price"]
    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
    paid:{
        type:Boolean,
        default:true
    },
    toDate:{
        type:Date
    },
    guests:{
        type:Number
    },
    numberOfNights:{
        type:Number
    }
},
{
    timestamps:true
}
);

bookingSchema.pre(/^find/,function(next){
    this.populate("user" .populate({
        path:property,
        select:"maximum guest images propertyName address"
    }));
    next();
});

const Booking = mongoose.model("Booking",bookingSchema);
export {Booking};