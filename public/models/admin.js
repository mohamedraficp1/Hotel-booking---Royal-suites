const mongoose = require('mongoose')

const adminSchema = new mongoose.Schema({
    email: String,
    password: String,
    category:[
        {
        categoryName: String,
        isDeleted: Boolean
    }
    ],
    vendors: [
        {
            vendorNmae: String,
            phoneNumber: Number,
            hotelNmae: String,
            email: String,
            password: String,
            isVerified: String
        }
    ]
})

module.exports= mongoose.model("Admin",adminSchema)