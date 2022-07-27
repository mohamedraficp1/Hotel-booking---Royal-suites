const mongoose = require('mongoose')

const adminSchema = new mongoose.Schema({
    name:String,
    email: String,
    location: String,
    hotelName: String,
    role: String,
    phoneNumber: Number,
    password: String,
    address:String,
    isVerified: String,
    profileImage:Array,
    messages:[Object],
    banner:[
        {
            title: String,
            subTitle: String,
            image:Array,
            bannerIsDeleted: Boolean
        }
    ],
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
        remainingRooms:Number,
        bed: String,
        rating: Number,
        reviews:[{
            name:String,
            date: Date,
            rating: Number,
            content: String,
        }
    
        ],
        wishlist:Array,
        img: Array,
        isDeleted: Boolean,
        createdAt: Date,
       
    }],

    booking : [
        {
            roomDetails: Object,
            checkInDate : Date,
            checkOutDate: Date,
            bookingDate: String,
            bokingStatus: String,
            noOfRoom: Number,
            totalAmount: Number,
            payementMetod: String,
            status: String,
            isActive: Boolean,
            checkedOut: Boolean,
            cancelled:Boolean,
            canCancel:Boolean
        }
    ],
    searchResults:Array
})

module.exports= mongoose.model("Admin",adminSchema)