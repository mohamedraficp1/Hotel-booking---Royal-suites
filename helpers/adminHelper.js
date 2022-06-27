var db= require('../config/connections')
var Admin= require('../models/admin')
var bcrypt= require('bcrypt')
var mongoose = require('mongoose')
const nodemailer = require('nodemailer')
module.exports={
    doLogin: (userData)=>{
        return new Promise(async(resolve,reject)=>{
           
          let response={}
          let admindetail=await Admin.findOne({email: userData.email, role: "admin"}) 
          if(admindetail){

              bcrypt.compare(userData.password,admindetail.password).then((status)=>{
                  
                  if(status){
                      console.log("Login success")
                      response.status=true;
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
                [ { $match : { isVerified : "pending" } } ]
            )
                resolve(displayVendor)
                console.log(displayVendor)
         
        })
    },

    getApprovedVendors : ()=>{
        return new Promise(async(resolve,reject)=>{ 
            let displayApprovedVendor = await Admin.aggregate(
                [ { $match : { isVerified : "approved" } } ]
            )
                resolve(displayApprovedVendor)
                console.log(displayApprovedVendor)
         
        })
    },

    uniqueCategory :(categoryData)=> {
        
        return new Promise (async(resolve, reject)=> {
            let response={}
            let uniqueCategory= await Admin.aggregate([{$match: {role: "admin"}},{ $unwind : "$category" },{ $match : { 'category.categoryName' : categoryData.category } }])
            console.log(uniqueCategory);
            let uniqueCategoryLength = uniqueCategory.length
            console.log(uniqueCategoryLength)
            if (uniqueCategoryLength){
                response.exist=true;
                resolve(response)
            }

            else{
                response.exist=false;
                resolve(response)  
            }
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
            console.log(displayCategory)
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

    getCatogoryRooms : (id)=>{
        return new Promise(async(resolve,reject)=>{ 
            let categoryDetail = await Admin.aggregate( [{ $match : { role : "admin" } },{ $unwind : "$category" },{$match:{'category._id':id}}] )
            let displayCatRoom = await Admin.aggregate( [ { $unwind : "$rooms" },{ $match : { 'rooms.isDeleted' : false,"isVerified" : "approved",  'rooms.category' : categoryDetail[0].category.categoryName} } ] )
            
            
            console.log(displayCatRoom)
            
            resolve(displayCatRoom)
        })
    }
}