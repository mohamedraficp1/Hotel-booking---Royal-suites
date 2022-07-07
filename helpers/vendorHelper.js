var db= require('../config/connections')
var Admin= require('../models/admin')
var bcrypt= require('bcrypt')
var mongoose = require('mongoose')

module.exports={
    doSignup: (userData)=>{
        return new Promise(async(resolve,reject)=>{
            userData.password= await bcrypt.hash(userData.password,10)
            let admindetail=await Admin.updateOne({},{$push:{vendors:{vendorNmae: userData.name,
                phoneNumber: userData.phoneNumber,
                hotelNmae: userData.hotelNmae,
                email: userData.email,
                password: userData.password} 
            }
                
            }).then((data)=>{
                console.log(data)
                resolve(data)
            })
        })
    },
    doLogin: (vendorData)=>{
        return new Promise(async(resolve,reject)=>{
           
          let response={}
          let vendorDetail=await Admin.findOne({role:"vendor",isVerified : "approved",email: vendorData.email}) 
          if(vendorDetail){

              bcrypt.compare(vendorData.password,vendorDetail.password).then((status)=>{
                  if(status){
                      console.log("Login success")
                      response.status=true;
                      response.vendor= vendorDetail.name
                      response.id=vendorDetail._id
                      response.email= vendorDetail.email
                      console.log(vendorDetail)
                      resolve(response)
                  }else{
                    
                    console.log("Login failed")
                    response.status=false
                    response.userErr=true
                      resolve(response) ;
                  }
              })
              
          }
          else{
            response.status=false
            response.paswdErr=true
            console.log("login failed")
            resolve(response) ;
        }
    
       }) 
    },
    addRoom :(roomData, vendorName, images)=>{
        return new Promise(async(resolve,reject)=>{
            let category=await Admin.updateOne({role:"vendor", name:vendorName},{$push:{rooms:{
                roomName: roomData.roomName,
                description:roomData.description,
                roomSize: roomData.roomSize,
                category: roomData.category,
                amenities: {
                    wifi: roomData.wifi,
                    ac:roomData.ac,
                    tv: roomData.tv,
                    parking: roomData.parking,
                    power:roomData.power
                },
                price:roomData.price,
                capacity:roomData.capacity,
                bed:roomData.bed,
                roomCount: roomData.roomCount,
                isDeleted: false,
                createdAt: new Date(),
                img: images}}
        }).then((data)=>{
            console.log(data)
            resolve(data)
        })
    })
},
getRoom : (vendorName)=>{
        return new Promise(async(resolve,reject)=>{ 
            let displayRoom = await Admin.aggregate([
                { $match : { name : vendorName } },
                {
                    $project:{
                        _id:0,
                        rooms:{
                            $filter:{
                                input: '$rooms',
                                as:'rooms',
                                cond: {
                                    $eq: [
                                        '$$rooms.isDeleted',false,
                                    ]
                                },
                                
                            }, 
                        },
                    }
                }
            ])
            resolve(displayRoom[0])
            console.log(displayRoom)
        })
    },

    deleteRoom:(id)=>{
        return new Promise(async(resolve,reject)=>{ 
            let deleteRoom = await Admin.updateOne({'rooms._id': id},{$set : {'rooms.$.isDeleted': true}})
            resolve(deleteRoom)
        })
    },

    getBookingDetails: (emailId)=>{
        return new Promise (async(resolve,reject)=>{
        try{
            let bookingDetail =  await Admin.aggregate( [
                { $match : { role: "user"}},{ $unwind : "$booking"  }
                ,{ $match : { 'booking.roomDetails.email':emailId ,'booking.status': "pending" }}] )
            console.log(bookingDetail)
            resolve(bookingDetail)
        }
        catch(e){
            console.log(e)
        }
  
    })
    },

    getBookingCancelDetails: (emailId)=>{
        return new Promise (async(resolve,reject)=>{
            try{
                let bookingCancelDetail =  await Admin.aggregate( [{ $match : { role: "user"}},{ $unwind : "$booking"  },{ $match : { 'booking.roomDetails.email':emailId ,'booking.status': "cancel" }}] )
                console.log(bookingCancelDetail)
                console.log('bookingcancxel')
                    resolve(bookingCancelDetail)
            }

            catch(e){
                console.log(e)
            }

    })
    },

}