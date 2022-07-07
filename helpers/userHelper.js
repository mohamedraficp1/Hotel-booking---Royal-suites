var db= require('../config/connections')
var Admin= require('../models/admin')
var bcrypt= require('bcrypt')
var mongoose = require('mongoose')
const async = require('hbs/lib/async')
const { errorMonitor } = require('nodemailer/lib/xoauth2')
const Razorpay = require('razorpay')
var instance = new Razorpay({ key_id: 'rzp_test_CeMgXyfbISX6hs', key_secret: 'NcX1d2PZpoiNU8Qy5c1tcu7g' })

module.exports={
    dosignUp: (userData)=>{
        return new Promise(async(resolve,reject)=>{
          let response={}
          let userdetail=await Admin.findOne({email: userData.email, role: "user"}) 
          if(userdetail){
            response.exist=true;
            resolve(response)
          }
          else{
           userData.password= await bcrypt.hash(userData.password,10)
            const admin= await Admin.create({name: userData.name,
                phoneNumber: userData.phoneNumber,
                email: userData.email,
                password: userData.password,
                role:"user",
                isVerified: "approved"}).then((data)=>{
                console.log(data)
                resolve(data)
            })
        }
    
       }) 
    },

    doLogin: (userData)=>{
        return new Promise(async(resolve,reject)=>{
           
          let response={}
          let userDetail=await Admin.findOne({role:"user",isVerified : "approved",email: userData.email}) 
          if(userDetail){

              bcrypt.compare(userData.password,userDetail.password).then((status)=>{
                  if(status){
                      console.log("Login success")
                      response.status=true;
                      response.user= userDetail.name
                      response.phone=userDetail.phoneNumber
                      response.email= userDetail.email
                      console.log(userDetail)
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

    getRoomDetails: (id)=>{
        return new Promise (async(resolve,reject)=>{
        let roomDetail =  await Admin.aggregate( [{ $match : { role: "vendor" }},{ $unwind : "$rooms" },{ $match : { 'rooms._id' : id } }] )
        console.log(roomDetail)
        resolve(roomDetail)
    })
    },

    getAllRooms : ()=>{
        return new Promise(async(resolve,reject)=>{ 
            let displayRoom = await Admin.aggregate( [
                 { $unwind : "$rooms" },
                 { $match : { 'rooms.isDeleted' : false,"isVerified" : "approved" } }
            ] )
            resolve(displayRoom)
            console.log(displayRoom)
        })
    },

    addBooking :(emails,checkIns, checkOuts,rooms, roomsDet)=>{
        return new Promise(async(resolve,reject)=>{ 
            try{
                let category=await Admin.updateOne({ role:"user",email: emails},
                {$push:{booking:{roomDetails: roomsDet, checkInDate: checkIns,checkOutDate: checkOuts,noOfRoom:rooms , status:"pending"}}

                }).then((data)=>{
                    console.log(data)
                    resolve(data)
                })      
            }
         catch(e){
             console.log(e)
         }     
    })
}
    ,
    getBookingDetails: (emailId)=>{
        return new Promise (async(resolve,reject)=>{
            try{
                let bookingDetail =  await Admin.aggregate( [
                    { $match : { role: "user",email:emailId }}
                    ,{ $unwind : "$booking"  },
                    { $match : { 'booking.status': "pending" }}
                ] )
                    resolve(bookingDetail)
            }

            catch(e){
                console.log(e);
            }
    })
    },

    getBookingCancelDetails: (emailId)=>{
        return new Promise (async(resolve,reject)=>{
            try{
                let bookingDetail =  await Admin.aggregate( [
                    { $match : { role: "user",email:emailId }},
                    { $unwind : "$booking"  },{ $match : { 'booking.status': "cancel" }}
                ] )
          
                resolve(bookingDetail)
            }

            catch(e){
                console.log(e)
            }

    })
    },

    searchFilter:(data)=>{
        return new Promise(async (resolve, reject) => {
        try {
            let result=[]
            console.log("re");
            result = await Admin.aggregate( [
                { $match : { role : "vendor",isVerified: 'approved' } },
                { $unwind : "$rooms" },
                {$match:{$or: data}},
                {$match:{'rooms.isDeleted': false}}] )
                console.log(result);
                  resolve(result)
        }
        catch(e){
            console.log(e)
        }
    })
       
      
      },

      getSearchRoom: (data)=>{
        return new Promise (async(resolve,reject)=>{
            try{
                let roomDetail =  await Admin.aggregate( [
                    { $match : { role: "vendor", location: data.location  }},
                    { $unwind : "$rooms" },
                    { $match : { 'rooms.isDeleted' : false,"isVerified" : "approved" } }
                    ] )
                console.log(roomDetail)
                resolve(roomDetail)
            }
            catch(e){
                console.logo(e)
            }
       
    })
    },

    cancelOrder:(id)=>{
        return new Promise(async(resolve,reject)=>{ 
            try{
                let approvevendor = await Admin.updateOne({'booking._id': id},
                {$set : {'booking.$.status': "cancel"}})
                resolve(approvevendor)
            }
            catch(e){
                console.log
            }
            
        })
    },

    generateRazorpay: (orderId) => new Promise((resolve, reject) => {
        const Razorpay = require('razorpay');
    
        const options = {
          amount: 50000, 
          currency: 'INR',
          receipt: `${orderId}`,
        };
        instance.orders.create(options, (err, order) => {
          if (err) {
            console.log(err);
          } else {
            resolve(order);
          }
        });
      }),

      verifyPayment: (details) => new Promise((resolve, reject) => {
        const crypto = require('crypto');
        let hmac = crypto.createHmac('sha256', 'NcX1d2PZpoiNU8Qy5c1tcu7g');
        hmac.update(
          `${details['payment[razorpay_order_id]']}|${details['payment[razorpay_payment_id]']}`,
        );
        hmac = hmac.digest('hex');
    
        if (hmac == details['payment[razorpay_signature]']) {
          resolve();
        } else {
          
          reject(err);
        }
      }),

      changePaymentStatus: (id)=> {
        return new Promise (async(resolve,reject)=>{
            try{
                let status =  await Admin.updateOne({'booking._id': id},
                {$set : {'booking.$.status': "cashPaid"}})
                resolve(status)
            }
            catch(e){
                console.log
            }
            
        })
      }

}