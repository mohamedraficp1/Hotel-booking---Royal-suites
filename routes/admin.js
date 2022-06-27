var express = require('express');
var router = express.Router();
var Admin= require('../models/admin')
const adminHelper= require("../helpers/adminHelper");
const async = require('hbs/lib/async');
var mongoose = require('mongoose')
var Sms =require('../config/verify')
const client = require('twilio')('AC1771c44d73f01a6a895be8eeb56b103f', 'ff24b7bc240cf38d8d18c7efaf48d157');

/* GET users listing. */
router.get('/', function(req, res, next) {
  // res.header('Cache-control','no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0,pre-check=0');
 let catExist= req.session.catExist
  if(req.session.adminloggedIn){
    adminHelper.getCategory().then((data)=>{
      adminHelper.getVendors().then((vendorData)=>{
        adminHelper.getApprovedVendors().then((approvedvendor)=>{
          res.render('admin/admin', { admin: true, data:data, vendorData:vendorData,approvedvendor:approvedvendor,catExist:catExist});
          req.session.catExist= false
        })
      })

    })
  }
  else {
    res.redirect('/admin/login')
  }
  
});


router.get('/login', function(req, res, next) {
  if(req.session.adminloggedIn){
    res.redirect('/admin')
  }
  else {
    res.render('admin/admin-login', {login:true,  paswdErr:req.session.paswdErr,userErr:req.session.userErr});
    req.session.paswdErr= false;
    req.session.userErr= false;
  }
});

router.get('/rooms', function(req, res, next) {
  if(req.session.adminloggedIn){
    adminHelper.getAllRoom().then((response)=>{
      res.render('admin/rooms', { admin: true, roomData:response})
    })
    
  }
  else {
    res.redirect('/admin/login')
  }
});

router.get('/otp-verify',(req,res)=>{
  // res.header('Cache-control','no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0,pre-check=0');
  res.render('admin/otp-verify', {login: true})
})

router.post('/login', function(req, res) {
  
  adminHelper.doLogin(req.body).then((response)=>{
    if(response.status){
      // req.session.adminloggedIn = true;
      // req.session.name = "Admin";
      // res.redirect('/admin')
      Sms.adminLogin().then((response)=>{
        if (response) {
          res.redirect('/admin/otp-verify')
        }
        else{
          res.redirect('/admin/login')
        }
      
    })
  }
    else if(response.userErr){
      req.session.paswdErr= true
      res.redirect('/admin/login')
    }
    else {
      req.session.userErr=true
      res.redirect('/admin/login')
    }
  })

});

router.post('/otp-verify',(req,res)=>{
  
  Sms.otpAdminVerify(req.body).then((response)=>{
    if (response.valid) {
     req.session.adminloggedIn = true;
      req.session.name = "Admin";
      res.redirect('/admin')
    }else{
      res.send('failed verifications')
    }
  })
})

router.post('/add-category', function(req, res) {
  adminHelper.uniqueCategory(req.body).then((resp)=>{
      if (resp.exist) {
        req.session.catExist= true
        res.redirect('/admin')
      }
      else {
        adminHelper.addCategory(req.body).then((data)=>{
          if (data) {
            res.redirect('/admin')
          }
        })
      }
  })
 
});

router.get('/delete-category/:id',function(req, res) {
    let id= mongoose.Types.ObjectId(req.params.id)
    adminHelper.deleteCategory(id).then((resp)=>{
      res.redirect('/admin')
    })
})

router.get('/approve-vendor/:id',function(req, res) {
  let id= mongoose.Types.ObjectId(req.params.id)
  adminHelper.approveVendor(id).then((resp)=>{
    res.redirect('/admin')
  })
})

router.get('/category/:id',function(req, res) {
  let id= mongoose.Types.ObjectId(req.params.id)
  adminHelper.getCatogoryRooms(id).then((catogoryRoom)=>{
    res.render('admin/rooms-category',{admin: true, catogoryRoom: catogoryRoom})
  })
})

router.post('/edit-category/:id',function(req, res) {
  let id= mongoose.Types.ObjectId(req.params.id)
  adminHelper.updateCategory(id,req.body) .then((resp)=>{
    console.log(req.body)
    res.redirect('/admin')
    console.log(req.body)
  })
})

router.get('/logout', function(req, res) {
  req.session.adminloggedIn = false;
  req.session.name= null;
  res.redirect('/admin/login');
});



// async function run() {
//   const admin= await Admin.create({email: "admin@royals.com", password:"$2a$10$du5LkR8gyq8fo13yTOZ54OwpQG1mNND.RNI0JZdmdnvzintVr4oFe", role: "admin"})
//   await admin.save
//   console.log(admin)
// }
// run()


module.exports = router;
