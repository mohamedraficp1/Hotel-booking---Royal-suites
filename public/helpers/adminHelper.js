var db= require('../config/connections')
var Admin= require('../models/admin')
var bcrypt= require('bcrypt')
var mongoose = require('mongoose')
const nodemailer = require('nodemailer')
module.exports={
    doLogin: (userData)=>{
        return new Promise(async(resolve,reject)=>{
           
          let response={}
          let admindetail=await Admin.findOne({email: userData.email}) 
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

    getVendors : ()=>{
        return new Promise(async(resolve,reject)=>{ 
            let displayVendor = await Admin.aggregate([
                {
                    $project:{
                        vendors: 1
                    }
                }
            ])
            resolve(displayVendor[0])
            console.log(displayVendor)
        })
    },

    addCategory :(categoryData)=>{
        return new Promise(async(resolve,reject)=>{
            let category=await Admin.updateOne({},{$push:{category:{categoryName: categoryData.category, isDeleted: false}}
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
    updateCategory:(id,categoryData)=> {
        return new Promise(async (resolve, reject)=> {
            let updateCategoryone= await Admin.updateOne({'category._id': id},{$set: {'category.$.categoryName': categoryData.editingCategory}})
            resolve(updateCategoryone)
        })
    }
}