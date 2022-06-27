var db= require('../config/connections')
var Admin= require('../models/admin')
var bcrypt= require('bcrypt')
var mongoose = require('mongoose')
const async = require('hbs/lib/async')

module.exports={
    getRoomDetails: (id)=>{
        return new Promise (async(resolve,reject)=>{
        let roomDetail =  await Admin.aggregate( [{ $match : { role: "vendor" }},{ $unwind : "$rooms" },{ $match : { 'rooms._id' : id } }] )
        console.log(roomDetail)
        resolve(roomDetail)
    })
    }

}