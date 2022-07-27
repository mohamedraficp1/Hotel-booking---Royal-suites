// require('dotenv').config()
// const mongoose= require('mongoose')
// mongoose.connect(process.env.MONGODB_CONNECTION_STRING, ()=>{
//     console.log("Connected")
// },
// e=>{
//     console.log("Connection error")
// })

require('dotenv').config()
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_CONNECTION_STRING,{

    useNewUrlParser:true

}).then((data)=>{
    console.log('mongodb atlas connected');
    return data
}).catch((e)=>{
    console.log(e+"mongodb atlas connection failed");
})
