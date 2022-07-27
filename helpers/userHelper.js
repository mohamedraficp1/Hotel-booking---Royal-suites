var db= require('../config/connections')
var Admin= require('../models/admin')
var bcrypt= require('bcrypt')
var mongoose = require('mongoose')
const async = require('hbs/lib/async')
const { errorMonitor } = require('nodemailer/lib/xoauth2')
const Razorpay = require('razorpay')
var Sms =require('../config/verify');
const { resolve } = require('path')
require('dotenv').config()


var instance = new Razorpay({ 
  key_id:process.env.RAZORPAY_KEY_ID, 
  key_secret: process.env.RAZORPAY_KEY_SECRET })

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

    doprofileUpdate: (userData)=>{
      return new Promise(async(resolve,reject)=>{
        let response={}
        const updated=  await Admin.updateOne({email: userData.email},{$set:{name:userData.fullName, address: userData.address}
        }).then((data)=>{
              console.log(data)
              resolve(data)
          })
  
     }) 
  },

  doUpdateImage:(emailId,data)=>{
     return new Promise(async(resolve,reject)=>{
        let updateImage= await Admin.updateOne({email: emailId},{$set:{profileImage:data}
        }).then((datas)=>{
            resolve(datas)
        })  
     })

  }
  ,
  getuserDetail:(emailId)=>{
    return new Promise(async(resolve,reject)=>{
    let userDetail=await Admin.findOne({role:"user",isVerified : "approved",email: emailId}).then((data)=>{
      resolve(data)
    }) 
  })  
  },

    forgotPassword: (userData)=>{
      return new Promise(async(resolve,reject)=>{
      try{
        let response={}
        let userDetail=await Admin.findOne({role:"user",isVerified : "approved",email: userData.email}) 
        if(userDetail){
          response.phoneNumber= userDetail.phoneNumber
          response.email= userDetail.email
          console.log(userDetail)
          const phoneNo= Number(userDetail)
          Sms.doSms(userDetail).then((data)=>{
            if (data) {
              console.log(data)
              resolve(response)
      
            }else{  
              console.log('otp failed redirect'+response);
            }
          })
          
        }
        else{
          response.status=false
          response.userErr=true
          console.log("login failed")
          reject(response) ;
          throw "invalid number";
      }
      }   
      catch(e) {
        console.log(e)
      }
       
  
     }) 
  },
  bookedStatus: (emailId,id)=>{
    return new Promise (async(resolve,reject)=>{
      try{
        const today = new Date();
        let bookingDetail =  await Admin.aggregate( [{ $match : { role: "user", email: emailId }},
                                  { $unwind : "$booking" },
                                  {
                                    $match: {
                                      $and: [
                                        { 'booking.status' : "cashPaid"  },
                                        { 'booking.roomDetails.rooms._id' : id  },
                                        { 'booking.checkOutDate': { $lte: today } },
                                      ],
                                    },

                                  },
                                ] )

                              resolve (bookingDetail)
                              console.log((today));
                              console.log(bookingDetail);
                            }
      catch(e){
        console.log(e)
      }
    })
  },

  updatePassword: (emailId,newPassword)=>{
    return new Promise(async(resolve,reject)=>{
      let response={}
      let userdetail=await Admin.findOne({email: emailId, role: "user"}) 
    
       const password= await bcrypt.hash(newPassword,10)
       const updated=  await Admin.updateOne({email: emailId},{$set:{password:password}
      }).then((data)=>{
            console.log(data)
            resolve(data)
        })
 

   }) 
},

    getRoomDetails: (id)=>{
        return new Promise (async(resolve,reject)=>{
        let roomDetail =  await Admin.aggregate( [{ $match : { role: "vendor" }},{ $unwind : "$rooms" },{ $match : { 'rooms._id' : id } }] )
        console.log(roomDetail)
        resolve(roomDetail)
    })
    },


    addReview: (emailId, roomId,review)=>{
        return new Promise (async(resolve,reject)=>{
        let roomDetail =  await Admin.updateOne({ 
          email: emailId,
          "rooms._id": roomId, 
        }, 
        {
          $push: {
            "rooms.$.reviews": review
          }
        })
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

    addBooking :(emails,checkIns, checkOuts,rooms, roomsDet, totalAmountPaid)=>{
        return new Promise(async(resolve,reject)=>{ 
          const today = new Date();
            const year = today.getFullYear();
    
            const month = (`0${today.getMonth() + 1}`).slice(-2);
            const day = today.getDate();
            const date = `${year}-${month}-${day}`;
            console.log(date)
            try{
                let category=await Admin.updateOne({ role:"user",email: emails},
                {$push:{booking:{roomDetails: roomsDet, checkInDate: checkIns,checkOutDate: checkOuts,noOfRoom:rooms ,totalAmount:totalAmountPaid, bookingDate: date, status:"pending",payementMetod:"online"}}

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
    setPayementMode: (id)=>{
      return new Promise (async(resolve,reject)=>{
          try{
            let payementMethod = await Admin.updateOne({'booking._id': id},
            {$set : {'booking.$.payementMetod': "At Hotel",'booking.$.bokingStatus': "confirmed"}})
                  resolve(payementMethod)
          }

          catch(e){
              console.log(e);
          }
  })
  },
    getBookingDetails: (emailId)=>{
        return new Promise (async(resolve,reject)=>{
            try{
                let bookingDetail =  await Admin.aggregate( [
                    { $match : { role: "user",email:emailId }}
                    ,{ $unwind : "$booking"  },
                    { $match : { 'booking.bokingStatus': "confirmed" }}
                ] )
                    resolve(bookingDetail)
            }

            catch(e){
                console.log(e);
            }
    })
    },

    getReview:(roomid)=>{
      return new Promise (async(resolve,reject)=>{
        try{
            let reviewDetail =  await Admin.aggregate([
  {
    '$match': {
      'role': 'vendor'
    }
  }, {
    '$unwind': {
      'path': '$rooms'
    }
  }, {
    '$match': {
      'rooms.isDeleted': false, 
      'rooms._id': roomid
    }
  }, {
    '$unwind': {
      'path': '$rooms.reviews'
    }
  }
])
                resolve(reviewDetail)
                console.log(reviewDetail)
                console.log("hjghjh");
        }

        catch(e){
            console.log(e);
        }
  })
    }

    ,getlastBooking: (emailId)=>{
      return new Promise (async(resolve,reject)=>{
          try{
              let bookingDetail =  await Admin.aggregate( [
                  { $match : { role: "user",email:emailId }}
                  ,{ $unwind : "$booking"  }
              ] )
                  resolve(bookingDetail)
          }

          catch(e){
              console.log(e);
          }
  })
  },

    getBookingCancelDetails: (emailId)=>{
      let date1 = new Date()
 
     

      return new Promise (async(resolve,reject)=>{
            try{
                let bookingDetail =  await Admin.aggregate( [
                    { $match : { role: "user",email:emailId }},
                    { $unwind : "$booking"  },{ $match : { 'booking.bokingStatus': "cancel" }}
                ] )
          
                resolve(bookingDetail)
            }

            catch(e){
                console.log(e)
            }

    })
    },

    searchFilter:(catdata, aminitiesData, priceData)=>{
        return new Promise(async (resolve, reject) => {
        try {
            let result=[]
            console.log("re");
            result = await Admin.aggregate( [
                { $match : { role : "admin" } },
                { $unwind : "$searchResults" },
                {$match:{$or: catdata}},
                {$match:{$or: aminitiesData}},
                // {
                //   $match: {'searchResults.rooms.price': { $lte: priceData  }
                //  }
                // }
                ] )
                console.log("ytyty")
                console.log(result);

                  resolve(result)
        }
        catch(e){
            console.log(e)
        }
    })
       
      
      },

      searchdbData:()=>{
        return new Promise(async (resolve, reject) => {
          try {
              let result=[]
              console.log("re");
              result = await Admin.aggregate( [
                { $match : { role : "admin" } },
                { $unwind : "$searchResults" },
                 ] )
                  console.log(result);
                    resolve(result)
          }
          catch(e){
              console.log(e)
          }
      })
         
        
      },

      searchFilterOne:(data,priceData)=>{
        return new Promise(async (resolve, reject) => {
        try {
            let result=[]
            console.log("re");
            result = await Admin.aggregate([
              { $match : { role : "admin" } },
              { $unwind : "$searchResults" },
              {$match:{$or: data}},
              // {
              //   $match: {'searchResults.rooms.price': { $lte: priceData  }
              //  }
              // },
                ])
                console.log(result);
                  resolve(result)
        }
        catch(e){
            console.log(e)
        }
    })
       
      
      },

    //   searchFilter:(catdata, aminitiesData)=>{
    //     return new Promise(async (resolve, reject) => {
    //     try {
    //         let result=[]
    //         console.log("re");
    //         result = await Admin.aggregate( [
    //             { $match : { role : "vendor",isVerified: 'approved' } },
    //             { $unwind : "$rooms" },
    //             {$match:{$or: catdata}},
    //             {$match:{$or: aminitiesData}},
    //             {$match:{'rooms.isDeleted': false}}] )
    //             console.log(result);
    //               resolve(result)
    //     }
    //     catch(e){
    //         console.log(e)
    //     }
    // })
       
      
    //   },

    //   searchFilterOne:(data)=>{
    //     return new Promise(async (resolve, reject) => {
    //     try {
    //         let result=[]
    //         console.log("re");
    //         result = await Admin.aggregate( [
    //             { $match : { role : "vendor",isVerified: 'approved' } },
    //             { $unwind : "$rooms" },
    //             {$match:{$or: data}},
    //             {$match:{'rooms.isDeleted': false}}] )
    //             console.log(result);
    //               resolve(result)
    //     }
    //     catch(e){
    //         console.log(e)
    //     }
    // })
       
      
    //   },


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
                {$set : {'booking.$.bokingStatus': "cancel"}})
                resolve(approvevendor)
            }
            catch(e){
                console.log
            }
            
        })
    },

    generateRazorpay: (orderId,amountPaid) => new Promise((resolve, reject) => {
     
        const Razorpay = require('razorpay');
        totalAmountPaid= Number(amountPaid*100)
        const options = {
          amount:  totalAmountPaid, 
          currency: 'INR',
          receipt: `${orderId}`,
        };
        instance.orders.create(options, (err, order) => {
          if (err) {
            console.log(err);
            reject(err)
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
                {$set : {'booking.$.status': "cashPaid",'booking.$.bokingStatus': "confirmed"}})
                resolve({status:true})
            }
            catch(e){
                console.log
            }
            
        })
      },
      addtoFavourites:(roomid, userId)=>{
          return new Promise(async(resolve, reject)=>{
                try{

                }
                catch{

                }
          })
      },

      getSearchResultRooms: (searchDatas) => new Promise(async (resolve, reject) => {

        const date_1 = new Date(searchDatas.checkIn);
        const date_2 = new Date(searchDatas.checkOut);
        try {
          
          const rooms = await Admin.aggregate
          ([
              { $match: { role: "vendor", location: searchDatas.location} },
              { $unwind: '$rooms' },
              { $match: { 'rooms.isDeleted' : false,"isVerified" : "approved"  } },
            ])
           
          const bookedRooms = await Admin.aggregate
            ([
              { $unwind: '$booking' },
              {$match:{'booking.bokingStatus': 'confirmed'}},
              {
                $match: {
                  $or: [
                    {
                      $and: [
                        { 'booking.checkOutDate': { $gte: date_1 } },
                        { 'booking.checkInDate': { $lte: date_2 } },
                      ],
                    },
                    {
                      $and: [
                        { 'booking.checkOutDate': { $gte: date_2 } },
                        { 'booking.checkInDate': { $lte: date_1 } },
                      ],
                    },
                  ],
                },
              },
              {
                $project: { booking: 1 },
              },
            ])
            console.log(searchDatas.checkIn)
            console.log("booked rooms");
            console.log(bookedRooms)
            console.log(".......")
            console.log("rooms");
            console.log(rooms)
            for (const x in rooms) {
              for (const y in bookedRooms) {
                if (rooms[x].rooms._id.equals(bookedRooms[y].booking.roomDetails.rooms._id)) {
                  
      
                  rooms[x].rooms.remainingRooms = rooms[x].rooms.roomCount - bookedRooms[y].booking.noOfRoom;
                  if (
                    rooms[x].rooms.remainingRooms == 0
                      || rooms[x].rooms.remainingRooms < searchDatas.rooms
                      || rooms[x].rooms.qty < searchDatas.rooms
                  ) {
                    rooms.splice(x, 1);
                  }
                }
              }
            }

          
            let searchrooms = await Admin.updateOne({role:"admin"},
            {$set : {searchResults: rooms}})
          resolve(rooms);
        } catch (error) {
          reject(error);
        }
      }),

      getlatestBanner:()=>{
        return new Promise(async(resolve,reject)=>{
            try{
              const banner = await Admin.aggregate
            ([
              { $match: { role: "admin"} },
              { $unwind: '$banner' },
              { $match: { 'banner.bannerIsDeleted' : false }},
              {$project:{banner:1}}
            ])
            resolve(banner)
           
            }
            catch(e){
                console.log(e);
            }
        })
    }

}