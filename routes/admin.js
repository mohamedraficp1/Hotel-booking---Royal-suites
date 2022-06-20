var express = require('express');
var router = express.Router();
var Admin= require('../public/models/admin')
const adminHelper= require("../public/helpers/adminHelper");
const async = require('hbs/lib/async');
var mongoose = require('mongoose')
const client = require('twilio')('AC1771c44d73f01a6a895be8eeb56b103f', 'ff24b7bc240cf38d8d18c7efaf48d157');

/* GET users listing. */
router.get('/', function(req, res, next) {
  if(req.session.adminloggedIn){
    adminHelper.getCategory().then((data)=>{
      adminHelper.getVendors().then((vendorData)=>{
      adminHelper.getApprovedVendors().then((approvedVendor)=>{
        res.render('admin/admin', { admin: true, data:data, vendorData:vendorData,approvedVendor:approvedVendor });
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
    res.render('admin/admin-login', { admin: true });
  }
});

router.post('/login', function(req, res) {
  
  adminHelper.doLogin(req.body).then((response)=>{
    if(response.status){
      // sendMeassage()
      req.session.adminloggedIn = true;
      req.session.name = "Admin";
      res.redirect('/admin')
      
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

router.post('/add-category', function(req, res) {
  adminHelper.addCategory(req.body).then((data)=>{
    if (data) {
      res.redirect('/admin')
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
  res.redirect('/admin/login');
});

function sendMeassage() {
  client.messages.create({
    body: 'Hello from rafi',
    to: '+918590529752',
    from: '+17164665261'
 }).then(message => console.log(message))
   // here you can implement your fallback code
   .catch(error => console.log(error))
 
}

// async function run() {
//   const admin= await Admin.create({email: "admin@royals.com", password:"$2a$10$du5LkR8gyq8fo13yTOZ54OwpQG1mNND.RNI0JZdmdnvzintVr4oFe"})
//   await admin.save
//   console.log(admin)
// }
// run()


module.exports = router;
