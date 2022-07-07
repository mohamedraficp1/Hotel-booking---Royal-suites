const mongoose = require('mongoose')

const adminSchema = new mongoose.Schema({
    name:String,
    email: String,
    location: String,
    role: String,
    phoneNumber: Number,
    password: String,
    isVerified: String,
    category:[
        {
        categoryName: String,
        isDeleted: Boolean
    }
    ],
    rooms:[{
        roomName: String,
        description:String,
        roomSize: String,
        category: String,
        amenities: {
            wifi: String,
            ac:String,
            tv: String,
            parking: String,
            power:String
        },
        price:Number,
        capacity: String,
        roomCount: Number,
        bed: String,
        rating: Number,
        reviews:[{
            name:String,
            date: Date,
            content: String,
        }],
        
        img: Array,
        isDeleted: Boolean,
        createdAt: Date,
       
    }],

    booking : [
        {
            roomDetails: Object,
            checkInDate : Date,
            checkOutDate: Date,
            noOfRoom: Number,
            totalAmount: Number,
            status: String
        }
    ]
})

module.exports= mongoose.model("Admin",adminSchema)