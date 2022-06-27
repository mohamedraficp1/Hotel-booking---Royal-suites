const mongoose= require('mongoose')
mongoose.connect("mongodb://localhost/royalsuites", ()=>{
    console.log("Connected")
},
e=>{
    console.log("Connection error")
})