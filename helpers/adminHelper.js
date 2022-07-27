var db= require('../config/connections')
var Admin= require('../models/admin')
var bcrypt= require('bcrypt')
var mongoose = require('mongoose')
const nodemailer = require('nodemailer')

module.exports={
    doLogin: async (userData)=>{
          let response={}
          let admindetail=await Admin.findOne({email: userData.email, role: "admin"}) 
          if(admindetail){
            let status=  bcrypt.compare(userData.password,admindetail.password)
                  if(status){
                      console.log("Login success")
                      response.status=true;
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
    doSignup: (vendorData)=>{
        return new Promise(async(resolve,reject)=>{
            vendorData.password= await bcrypt.hash(vendorData.password,10)
            const admin= await Admin.create({name: vendorData.name,
                phoneNumber: vendorData.phoneNumber,
                email: vendorData.email,
                password: vendorData.password,
                role:"vendor",
                isVerified: "pending"}).then((data)=>{
                console.log(data)
                resolve(data)
            })
        })
    },

    // getVendors : ()=>{
    //     return new Promise(async(resolve,reject)=>{ 
    //         let displayVendor = await Admin.aggregate([
    //             {
    //                 $project:{
    //                     _id:0,
    //                     vendors:{
    //                         $filter:{
    //                             input: '$vendors',
    //                             as:'vendors',
    //                             cond: {
    //                                 $eq: [
    //                                     '$$vendors.isVerified',"pending",
    //                                 ]
    //                             },
                                
    //                         }, 
    //                     },
    //                 }
    //             }
    //         ])
    //         resolve(displayVendor[0])
    //         console.log(displayVendor)
    //     })
    // },

    getVendors : ()=>{
        return new Promise(async(resolve,reject)=>{ 
            let displayVendor = await Admin.aggregate(
                [ { $match : { isVerified : "pending",role:"vendor" } } ]
            )
                resolve(displayVendor)
                console.log(displayVendor)
         
        })
    },

    getApprovedVendors : ()=>{
        return new Promise(async(resolve,reject)=>{ 
            let displayApprovedVendor = await Admin.aggregate(
                [ { $match : { isVerified : "approved",role:"vendor" } } ]
            )
                resolve(displayApprovedVendor)
                console.log(displayApprovedVendor)
         
        })
    },

    uniqueCategory :(categoryData)=> {
        
        return new Promise (async(resolve, reject)=> {
            let response={exist:false}
            let uniqueCategory= await Admin.aggregate([
                {$match: {role: "admin"}},
                { $unwind : "$category" },
                { $match : { 'category.categoryName' : categoryData.category } }
            ])
            console.log(uniqueCategory);
            let uniqueCategoryLength = uniqueCategory.length
            console.log(uniqueCategoryLength)
            if (uniqueCategoryLength){
                response.exist=true;
                resolve(response)
            }

            // else{
                // response.exist=false;
                resolve(response)  
            // }
        })
    },

    addCategory :(categoryData)=>{
        return new Promise(async(resolve,reject)=>{ 
                let category=await Admin.updateOne({role:"admin"},{$push:{category:{categoryName: categoryData.category, isDeleted: false}}
            }).then((data)=>{
                console.log(data)
                resolve(data)
            })      
    })
},
    getCategory : ()=>{
        return new Promise(async(resolve,reject)=>{ 
            let displayCategory = await Admin.aggregate([
                {
                    $project:{
                        _id:0,
                        category:{
                            $filter:{
                                input: '$category',
                                as:'category',
                                cond: {
                                    $eq: [
                                        '$$category.isDeleted',false,
                                    ]
                                },
                                
                            }, 
                        },
                    }
                }
            ])
            resolve(displayCategory[0])
            console.log(displayCategory[0])
        })
    },
    deleteCategory:(id)=>{
        return new Promise(async(resolve,reject)=>{ 
            let deleteCategory = await Admin.updateOne({'category._id': id},{$set : {'category.$.isDeleted': true}})
            resolve(deleteCategory)
        })
    },

    approveVendor:(id)=>{
        return new Promise(async(resolve,reject)=>{ 
            let approvevendor = await Admin.updateOne({'_id': id},{$set : {'isVerified': "approved"}})
            resolve(approvevendor)
        })
    },

    rejectVendor:(id)=>{
        return new Promise(async(resolve,reject)=>{ 
            let approvevendor = await Admin.updateOne({'_id': id},{$set : {'isVerified': "rejected"}})
            resolve(approvevendor)
        })
    },

    blockuser:(id)=>{
        return new Promise(async(resolve,reject)=>{ 
            let approvevendor = await Admin.updateOne({'_id': id, role:"user"},{$set : {'isVerified': "blocked"}})
            resolve(approvevendor)
        })
    },

    unblockuser:(id)=>{
        return new Promise(async(resolve,reject)=>{ 
            let approvevendor = await Admin.updateOne({'_id': id, role:"user"},{$set : {'isVerified': "approved"}})
            resolve(approvevendor)
        })
    },

    // getCategoryDetail:(categoryId)=> {
    //     return new Promise((resolve,reject)=>{
    //         db.get().collection(collection.USER_COLLECTION).findOne({'vendors._id':objectId(categoryId)}).then((user)=>{
    //             resolve(user)
                
    //         })
    //     })
    // },
    updateCategory:(id,categoryData)=> {
        return new Promise(async (resolve, reject)=> {
            let updateCategoryone= await Admin.updateOne({'category._id': id},{$set: {'category.$.categoryName': categoryData.categoryEdit}})
            resolve(updateCategoryone)
        })
    },

    getAllRoom : ()=>{
        return new Promise(async(resolve,reject)=>{ 
            let displayRoom = await Admin.aggregate( [ { $unwind : "$rooms" },{ $match : { 'rooms.isDeleted' : false,"isVerified" : "approved" } } ] )
            resolve(displayRoom)
            console.log(displayRoom)
        })
    },

    getAllmessages : ()=>{
      return new Promise(async(resolve,reject)=>{ 
          let displaymessages = await Admin.aggregate( [{$match:{role:"admin"}}, { $unwind : "$messages" } ] )
          console.log(displaymessages);
          resolve(displaymessages)
          
      })
  },

    getAllUsers : ()=>{
        return new Promise(async(resolve,reject)=>{ 
            let displayUser = await Admin.aggregate(
                [ { $match : { isVerified : "approved",role:"user" } } ]
            )
                resolve(displayUser)
                console.log(displayUser)
         
        })
    },

    getAllBlockedUsers : ()=>{
        return new Promise(async(resolve,reject)=>{ 
            let displayUser = await Admin.aggregate(
                [ { $match : { isVerified : "blocked",role:"user" } } ]
            )
                resolve(displayUser)
                console.log(displayUser)
         
        })
    },


    getCatogoryRooms : (id)=>{
        return new Promise(async(resolve,reject)=>{ 
            let categoryDetail = await Admin.aggregate( [{ $match : { role : "admin" } },{ $unwind : "$category" },{$match:{'category._id':id}}] )
            let displayCatRoom = await Admin.aggregate( [ { $unwind : "$rooms" },{ $match : { 'rooms.isDeleted' : false,"isVerified" : "approved",  'rooms.category' : categoryDetail[0].category.categoryName} } ] )
            
            
            console.log(displayCatRoom)
            
            resolve(displayCatRoom)
        })
    },

    changeBannerImage: (data,images)=> {
        return new Promise(async(resolve,reject)=>{
            let category=await Admin.updateOne({role:"admin"},
            {$push:{banner:{
                title: data.title,
                subTitle:data.subtitle,
                image: images,
                bannerIsDeleted: false
            }}
        })
    })
    },
    getBanner : ()=>{
        return new Promise(async(resolve,reject)=>{ 
            let displayBanner = await Admin.aggregate([
                {$match:{role: "admin"}},
                {
                    $project:{
                        _id:0,
                        banner:{
                            $filter:{
                                input: '$banner',
                                as:'banner',
                                cond: {
                                    $eq: [
                                        '$$banner.bannerIsDeleted',false,
                                    ]
                                },
                                
                            }, 
                        },
                    }
                }
            ])
            resolve(displayBanner[0])
            console.log(displayBanner[0].banner.length)
        })
    },

    deleteBanner:(id)=>{
        return new Promise(async(resolve,reject)=>{ 
            try{
                let deleteBanner = await Admin.updateOne({'banner._id': id},{$set : {'banner.$.bannerIsDeleted': true}})
                resolve(deleteBanner)

            }
            catch(e){
                console.log(e)
            }
            
        })
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
             
               'booking.bokingStatus': 'confirmed'
                
                },
              },
            
              {
                $group: {
                  _id: {
                    date: '$booking.bookingDate',
                    vendor: '$booking.roomDetails.hotelName',
                   
                  },
                  total: { $sum: '$booking.totalAmount' },
                },
              },

              { $sort : { date: -1 } }
            ])
           
    
          resolve(sales);
        });
      }
      catch(e){
        console.log(e);
      }
      },

      getTotalSalesEachday: (emailId) => {
        try{
        return new Promise(async (resolve, reject) => {
          const sales = await Admin.aggregate([
              {
                $unwind: '$booking',
              },
              {
                $match: {
             
               'booking.bokingStatus': 'confirmed'
                
                },
              },
            
              {
                $group: {
                  _id: {
                    date: '$booking.bookingDate',
                  },
                  total: { $sum: '$booking.totalAmount' },
                },
              },

              { $sort : { date: -1 } }
            ])
           
    
          resolve(sales);
        });
      }
      catch(e){
        console.log(e);
      }
      },

      getTotalsaleAmount: () => {
        try{
        return new Promise(async (resolve, reject) => {
          const sales = await Admin.aggregate([
              {
                $unwind: '$booking',
              },
              {
                $match: {
                  $and: [
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
      getTodaysSalesCount: () => {
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

      getActiveBookings: () => {
        try {
          return new Promise(async (resolve, reject) => {
            const today = new Date();
    
            const bookings = await Admin.aggregate([
                { $unwind: '$booking' },
                {
                  $match: {
                    $and: [
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

      messagesFromClient:async(queryOne,queryTwo)=>{
          try{
             const addMessage= await Admin.updateOne(queryOne,queryTwo)
             return addMessage
          }
          catch(e){
              console.log(e)
          }
      },

        messageCount:async()=>{
            try{
                const count = await Admin.aggregate([queryOne,queryTwo,queryThree]) 
                return count
            }
            catch(e){
                console.log(e)
            }
            
        },

      getTodaysSalesAmount: () => {
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

      getTodaysSalesPerVendor: () => {
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
                      { 'booking.bokingStatus': 'confirmed' },
                      { 'booking.bookingDate': date  },
                    ],
                  },
                },

                {
                  $group: {
                    _id: '$booking.roomDetails.hotelName',
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
  
  
}