const express = require('express');
const router = express.Router();
const adminHelper= require("../helpers/adminHelper");
const mailer = require('../config/email')
const store= require('../config/multer')
const mongoose = require('mongoose')
const Sms =require('../config/verify')
const { Store } = require('express-session');



/* GET users listing. */
router.get('/', function(req, res) {
  // res.header('Cache-control','no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0,pre-check=0');
 let catExist= req.session.catExist
  if(req.session.adminloggedIn){
    adminHelper.getCategory().then((data)=>{
      adminHelper.getVendors().then((vendorData)=>{
        adminHelper.getApprovedVendors().then((approvedvendor)=>{
          mailer.doEmail()
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


router.get('/login', function(req, res) {
  if(req.session.adminloggedIn){
    res.redirect('/admin')
  }
  else {
    res.render('admin/admin-login', {login:true,  paswdErr:req.session.paswdErr,userErr:req.session.userErr});
    req.session.paswdErr= false;
    req.session.userErr= false;
  }
});

router.get('/rooms', function(req, res) {
  if(req.session.adminloggedIn){
    adminHelper.getAllRoom().then((response)=>{
      res.render('admin/rooms', { admin: true, roomData:response})
    })
    
  }
  else {
    res.redirect('/admin/login')
  }
});

router.get('/messages', function(req, res) {
  if(req.session.adminloggedIn){
    adminHelper.getAllmessages().then((response)=>{
      res.render('admin/messages', { admin: true, response})
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
      req.session.adminloggedIn = true;
      req.session.name = "Admin";
      res.redirect('/admin')
    //   Sms.adminLogin().then((response)=>{
    //     if (response) {
    //       res.redirect('/admin/otp-verify')
    //     }
    //     else{
    //       res.redirect('/admin/login')
    //     }
      
    // })
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

router.post ('/send-mail-toClient', (req,res)=>{
  mailer.doEmail(req.body.email, req.body.message)
  console.log(req.body)
  console.log("body")
  res.redirect('/admin/messages')
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
    adminHelper.deleteCategory(id).then(()=>{
      res.redirect('/admin')
    })
})

router.get('/approve-vendor/:id',function(req, res) {
  let id= mongoose.Types.ObjectId(req.params.id)
  adminHelper.approveVendor(id).then(()=>{
    res.redirect('/admin')
  })
})

router.get('/reject-vendor/:id',function(req, res) {
  let id= mongoose.Types.ObjectId(req.params.id)
  adminHelper.rejectVendor(id).then(()=>{
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
  adminHelper.updateCategory(id,req.body) .then(()=>{
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

router.get('/users', function(req,res){
  adminHelper.getAllUsers().then((response)=>{
    adminHelper.getAllBlockedUsers().then((users)=>{
    res.render('admin/users',{admin: true,response: response, users})
    
  })
})
})

router.get('/vendors', function(req,res){
  adminHelper.getApprovedVendors().then((response)=>{
    adminHelper.getVendors().then((vendors)=>{
    res.render('admin/vendor',{admin: true,response: response, vendors})
    
  })
})
})

router.get('/change-banner', function(req,res){
  adminHelper.getBanner().then((response)=>{
    res.render('admin/change-banner',{admin: true,response: response})
  })
})

router.get('/block-user/:id',function(req, res) {
  let id= mongoose.Types.ObjectId(req.params.id)
  adminHelper.blockuser(id).then(()=>{
    res.redirect('/admin/users')
  })
})

router.get('/unblock-user/:id',function(req, res) {
  let id= mongoose.Types.ObjectId(req.params.id)
  adminHelper.unblockuser(id).then(()=>{
    res.redirect('/admin/users')
  })
})

router.get('/sales',async function(req,res){
  sales= await adminHelper.getTotalSales()
    totalSales = await adminHelper.getTotalsaleAmount()
    todaySaleAmount = await adminHelper.getTodaysSalesAmount()
    todySaleCount= await adminHelper.getTodaysSalesCount()
    todaysTotaleSaleCount= todySaleCount.length
    activeBooking= await adminHelper.getActiveBookings()
    activeBookingCount= activeBooking.length
    salespervendor= await adminHelper.getTodaysSalesPerVendor()
    salesperDay = await adminHelper.getTotalSalesEachday()
    const reformattedArrayDate =salespervendor.map(x => (x._id));
     const reformattedArrayTotal =salespervendor.map(x => (x.total));
    res.render('admin/sale',{admin: true,sales,totalSales, todaySaleAmount,todaysTotaleSaleCount,activeBookingCount,activeBooking,reformattedArrayDate,
      reformattedArrayTotal })
    console.log("rrrr");   
    console.log(sales);
    console.log(totalSales);
    console.log(todaySaleAmount);
    console.log(todySaleCount);
    console.log(salespervendor);
    console.log(reformattedArrayDate);
    console.log(reformattedArrayTotal);
})

router.post('/change-banner-image', store.array('banner-images'), (req, res) => {
    console.log(req.body)
    console.log(req.files)
    adminHelper.changeBannerImage(req.body, req.files). then((response)=>{
      console.log(response);
      res.redirect('/admin/change-banner')
    })
});

router.get('/delete-banner/:id',function(req, res) {
  let id= mongoose.Types.ObjectId(req.params.id)
  console.log(id);
  adminHelper.deleteBanner(id).then(()=>{
    res.redirect('/admin/change-banner')
  })
})
  
// async function run() {
//   const admin= await Admin.create({email: "admin@royals.com", password:"$2a$10$du5LkR8gyq8fo13yTOZ54OwpQG1mNND.RNI0JZdmdnvzintVr4oFe", role: "admin"})
//   await admin.save
//   console.log(admin)
// }
// run()


module.exports = router;
