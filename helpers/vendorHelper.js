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
    doLogin: async (vendorData)=>{

          let vendorDetail=await Admin.findOne({role:"vendor",isVerified : "approved",email: vendorData.email}) 
          let response={}
          if(vendorDetail){

          const status=bcrypt.compare(vendorData.password,vendorDetail.password)
                  if(status){
                      console.log("Login success")
                      response.status=true;
                      response.vendor= vendorDetail.name
                      response.id=vendorDetail._id
                      response.email= vendorDetail.email
                      console.log(vendorDetail)
                      return response
                  }else{
                    
                    console.log("Login failed")
                    response.status=false
                    response.userErr=true
                    return response ;
                  }
            
              
          }
          else{
            response.status=false
            response.paswdErr=true
            console.log("login failed")
            return response ;
        }
   
     
    },
    addRoom :async(roomData, vendorName, images)=>{
       
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
                img: images}}, 
    })
    return category
},

editRoom :(roomData, vendorName)=>{
  return new Promise(async(resolve,reject)=>{
      let category=await Admin.updateOne({role:"vendor", name:vendorName},{$set:{
          'rooms.$.roomName': roomData.roomName,
          'rooms.$.description':roomData.description,
          'rooms.$.roomSize': roomData.roomSize,
          'rooms.$.category': roomData.category,
          'rooms.$.amenities': {
              wifi: roomData.wifi,
              ac:roomData.ac,
              tv: roomData.tv,
              parking: roomData.parking,
              power:roomData.power
          },
          'rooms.$.price':roomData.price,
          'rooms.$.capacity':roomData.capacity,
          'rooms.$.bed':roomData.bed,
          'rooms.$.roomCount': roomData.roomCount,
          'rooms.$.isDeleted': false,
          'rooms.$.createdAt': new Date(),
          }
  })
})
},
getRoom : async (vendorName)=>{
       try{
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
            return(displayRoom[0]) 
          }

          catch(e){
            
          }
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

    getReservations: (emailId) => {
        try {
          return new Promise(async (resolve, reject) => {
            const today = new Date();
            const year = today.getFullYear();
    
            const month = (`0${today.getMonth() + 1}`).slice(-2);
            const day = today.getDate();
            const date = new Date(`${year}-${month}-${day}`);
            console.log(today)
    
            const reservations = await Admin.aggregate([
                { $unwind: '$booking' },
                {
                  $match: {
                    $and: [
                      { 'booking.roomDetails.email': emailId },
                      { 'booking.checkInDate': { $gte: date } },
                      { 'booking.status': { $ne: 'cancelled' } },
                    ],
                  },
                }
              ])
        
            resolve(reservations);
          });
        } catch (error) {
          reject(error);
        }
      },

      getDailySales: (emailId) => {
        try {
          return new Promise(async (resolve, reject) => {
            const sales = await Admin.aggregate([
                {
                  $unwind: '$booking',
                },
        
                {
                  $match: {
                    $and: [
                      { 'booking.roomDetails.email': emailId },
                      { 'booking.bokingStatus': 'confirmed' },
                    ],
                  },
                },
                {
                  $group: {
                    _id: '$booking.bookingDate',
                    total: { $sum: '$booking.totalAmount' },
                  },
                },

                { $sort : { _id : 1 } },
                
              ])
             
    
            // function compare(a, b) {
            //   if (a._id.split('-')[2] < b._id.split('-')[2]) {
            //     return -1;
            //   }
            //   if (a._id.split('-')[2] > b._id.split('-')[2]) {
            //     return 1;
            //   }
            //   return 0;
            // }
    
            // sales.sort(compare);
            // const date = [];
            // const sales1 = [];
            // const datas = {
            //   date,
            //   sales1,
            // };
            // for (const x in sales) {
            //   (datas.date[x] = sales[x]._id.split('-')[2]),
            //     (datas.sales1[x] = sales[x].total);
            // }
    
            resolve(sales);
          });
        } catch (error) {
          reject(error);
        }
      },

      getTotalSales: (emailId) => {
        try{
        return new Promise(async (resolve, reject) => {
          const sales = await Admin.aggregate([
              {
                $unwind: '$booking',
              },
              {
                $match: {
                  $and: [
                    { 'booking.roomDetails.email': emailId },
                    { 'booking.bokingStatus': 'confirmed' },
                  ],
                },
              },
              {
                $group: {
                  _id: ' ',
                  total: { $sum: '$booking.totalAmount' },
                },
              },
            ])
           
    
          resolve(sales);
        });
      }
      catch(e){
        console.log(e);
      }
      },

      getTodaysBookings: (emailId) => {
        try {
          return new Promise(async (resolve, reject) => {
            const today = new Date();
    
            const bookings = await Admin.aggregate([
                { $unwind: '$booking' },
                {
                  $match: {
                    $and: [
                      { 'booking.roomDetails.email': emailId },
                      { 'booking.bokingStatus': 'confirmed' },
                      { 'booking.checkInDate': { $lte: today } },
                      { 'booking.checkOutDate': { $gte: today } },
                    ],
                  },
                },
              ])
              
            resolve(bookings);
          });
        } catch (error) {
          reject(error);
        }
      },

      getTodaysSalesCount: (emailId) => {
        try {
          return new Promise(async (resolve, reject) => {
            const today = new Date();
            const year = today.getFullYear();
    
            const month = (`0${today.getMonth() + 1}`).slice(-2);
            const day = today.getDate();
            const date = (`${year}-${month}-${day}`);
            console.log(date)
    
            const bookings = await Admin.aggregate([
                { $unwind: '$booking' },
                {
                  $match: {
                    $and: [
                      { 'booking.roomDetails.email': emailId },
                      { 'booking.bokingStatus': 'confirmed' },
                      { 'booking.bookingDate': date  },
                    ],
                  },
                },
              ])
              
            resolve(bookings);
          });
        } catch (error) {
          reject(error);
        }
      },

      getRoomsSalesAmount: (emailId) => {
        try {
          return new Promise(async (resolve, reject) => {
            const bookings = await Admin.aggregate([
                { $unwind: '$booking' },
                {
                  $match: {
                    $and: [
                      { 'booking.roomDetails.email': emailId },
                      { 'booking.bokingStatus': 'confirmed' },
                    ],
                  },
                },

                {
                  $group: {
                    _id: '$booking.roomDetails.rooms.roomName',
                    total: { $sum: '$booking.totalAmount' },
                  },
                },
              ])
              
            resolve(bookings);
          });
        } catch (error) {
          reject(error);
        }
      },

      getTodaysSalesAmount: (emailId) => {
        try {
          return new Promise(async (resolve, reject) => {
            const today = new Date();
            const year = today.getFullYear();
    
            const month = (`0${today.getMonth() + 1}`).slice(-2);
            const day = today.getDate();
            const date = (`${year}-${month}-${day}`);
    
            const bookings = await Admin.aggregate([
                { $unwind: '$booking' },
                {
                  $match: {
                    $and: [
                      { 'booking.roomDetails.email': emailId },
                      { 'booking.bokingStatus': 'confirmed' },
                      { 'booking.bookingDate': date  },
                    ],
                  },
                },

                {
                  $group: {
                    _id: ' ',
                    total: { $sum: '$booking.totalAmount' },
                  },
                },
              ])
              
            resolve(bookings);
          });
        } catch (error) {
          reject(error);
        }
      },

      roomUpdate:async (querryOne,queryTwo,queryThree)=>{
          let roomDetails = await Admin.aggregate([querryOne,queryTwo,queryThree])
          return roomDetails
      },

      getSaleOnAday:(emailId,date)=>{
        try {
          return new Promise(async (resolve, reject) => {
        const bookings = await Admin.aggregate([
          { $unwind: '$booking' },
          {
            $match: {
              $and: [
                { 'booking.roomDetails.email': emailId },
                { 'booking.bokingStatus': 'confirmed' },
                { 'booking.bookingDate': date  },
              ],
            },
          },
        ])
        
      resolve(bookings);
    });
  } catch (error) {
    reject(error);
  }
      }
    

}