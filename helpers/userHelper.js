var db= require('../config/connections')
var Admin= require('../models/admin')
var bcrypt= require('bcrypt')
var mongoose = require('mongoose')
const async = require('hbs/lib/async')
const { errorMonitor } = require('nodemailer/lib/xoauth2')

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
                      response.id=userDetail._id
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

    addBooking :(emails,checkIns, checkOuts,rooms, roomsid, vendorsid)=>{
        return new Promise(async(resolve,reject)=>{ 
                let category=await Admin.updateOne({ role:"user",email: emails},{$push:{booking:{roomId: roomsid,vendorId:vendorsid, checkInDate: checkIns,checkOutDate: checkOuts,noOfRoom:rooms , status:"pending"}}
            }).then((data)=>{
                console.log(data)
                resolve(data)
            })      
    })
}
    ,

    searchFilter:(data)=>{
        return new Promise(async (resolve, reject) => {
          let result=[]
          console.log("re");
          result = await Admin.aggregate( [
              { $match : { role : "vendor" } },
              { $unwind : "$rooms" },
              {$match:{$or: data}}] )
              console.log(result);
                resolve(result)
      })
      },

      getSearchRoom: (data)=>{
        return new Promise (async(resolve,reject)=>{
        let roomDetail =  await Admin.aggregate( [
            { $match : { role: "vendor", name: data.location  }},
            { $unwind : "$rooms" },
            { $match : { 'rooms.isDeleted' : false,"isVerified" : "approved" } }
            ] )
        console.log(roomDetail)
        resolve(roomDetail)
    })
    }

}