var express = require('express');
const adminHelper = require('../helpers/adminHelper');
var router = express.Router();
const vendorHelper = require('../helpers/vendorHelper')
const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
var Sms =require('../config/verify');
const { response } = require('../app');
const { default: mongoose } = require('mongoose');

/* GET users listing. */
router.get('/', function(req, res, next) {
  if(req.session.vendorloggedIn){
    let name = req.session.name
    vendorHelper.getRoom(req.session.name).then((response)=>{
      res.render('vendor/vendor', { vendor: true , name: name, roomData: response });

  })
  }
  else {
    res.redirect('/vendor/login')
  }
  

});

router.get('/signup', function(req, res, next) {
  res.render('vendor/vendor-signup', { login: true });
});

router.get('/login', function(req, res, next) {
  let vendorErr= req.session.vendorErr
  if(req.session.vendorloggedIn){
    res.redirect('/vendor')
  }
  else {
    res.render('vendor/vendor-login', { login: true, vendorErr:vendorErr});
    req.session.vendorErr=false
  }
  
});

router.post('/login', function(req, res, next) {
  vendorHelper.doLogin(req.body).then((response)=>{
    if(response.status){
      req.session.vendorloggedIn = true;
      req.session.name = response.vendor
      req.session.id=response.id
      req.session.vendorEmail= response.email
      console.log(req.session)
      res.redirect('/vendor')
      
    }
    else if(response.userErr){
      req.session.vendorErr= true
      res.redirect('/vendor/login')
    }
    else {
      req.session.vendorErr=true
      res.redirect('/vendor/login')
    }
  })
});

router.get('/add-room', function(req,res) {
  adminHelper.getCategory().then((data)=>{
    res.render('vendor/room-register-form', { vendor: true, name: req.session.name,data:data })
  })
})

/* File upload*/
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
      cb(null, './public/images/room-images/');
  },

  filename: function(req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

var upload = multer({ storage: storage })

router.post('/add-room', upload.array('multi-files'), (req, res) => {
  let name = req.session.name
  let images = req.files
  vendorHelper.addRoom(req.body, name, images ).then ((response)=>{
      if (response){
        res.redirect('/vendor')
      }
      else {
        res.redirect('/vendor/add-room')
      }
  })
});


router.post('/edit-room', upload.array('multi-files'), (req, res) => {
  let name = req.session.name
  let images = req.files
  vendorHelper.editRoom(req.body, name ).then ((response)=>{
    if (response){
      res.redirect('/vendor')
    }
    else {
      res.redirect('/vendor/add-room')
    }
})
});

// post method signup
router.post('/signup',(req,res)=>{
  req.session.sellerData = req.body
  
  console.log(req.session.sellerData);
      Sms.doSms(req.session.sellerData).then((response)=>{
        if (response) {
          res.redirect('/vendor/otp-verify')

        }else{
          
          console.log('otp failed redirect'+response);
        }
      })

})


// seller otp verify
router.get('/otp-verify',(req,res)=>{
  console.log(req.session.sellerData);
  res.render('vendor/otp-verify', {login: true})
})
 
router.post('/otp-verify',(req,res)=>{
  console.log(req.body,req.session.sellerData);
  Sms.otpVerify(req.body,req.session.sellerData).then((response)=>{
    if (response.valid) {
     
       adminHelper.doSignup(req.session.sellerData).then((response)=>{
        req.session.vendorloggedIn = true;
       res.redirect('/vendor')
    })
    }else{
      res.send('failed verifications')
    }
  })
})

router.get('/logout', function(req, res,) {
  req.session.vendorloggedIn = false;
  req.session.name = null;
  res.redirect('/vendor/login');
});

/** Delete Room */

router.get('/delete-room/:id',function(req,res){
  let id= mongoose.Types.ObjectId(req.params.id)
    vendorHelper.deleteRoom(id).then((response)=>{
        res.redirect('/vendor')
    })
})

router.get('/booking-details',(req,res)=>{
  vendorHelper.getBookingDetails(req.session.vendorEmail).then((data)=>{
    vendorHelper.getBookingCancelDetails(req.session.vendorEmail).then((cancelledData)=>{
      vendorHelper.getReservations(req.session.vendorEmail).then((responses)=>{
        vendorHelper.getDailySales(req.session.vendorEmail).then((sales)=>{
          vendorHelper.getTodaysBookings(req.session.vendorEmail).then((todaysBooking)=>{
        console.log(req.session.vendorEmail)
        console.log('tttt');
        console.log(sales);
        console.log(responses);
        res.render('vendor/booking-details', {vendor: true,name: req.session.name,bookingData:responses,todaysBooking,cancelledData:cancelledData, sales:sales})
      })
  })
})
    })
  })
  
})

router.get('/sales',(req,res)=>{
  try{
    vendorHelper.getDailySales(req.session.vendorEmail).then((sales)=>{
      vendorHelper.getTotalSales(req.session.vendorEmail).then((totalSale)=>{
        vendorHelper.getTodaysBookings(req.session.vendorEmail).then((todaysBooking)=>{
          vendorHelper.getTodaysSalesAmount(req.session.vendorEmail).then((totayBookingamount)=>{
            vendorHelper.getTodaysSalesCount(req.session.vendorEmail).then((todaysBookingcount)=>{
              vendorHelper.getRoomsSalesAmount(req.session.vendorEmail).then((roomSale)=>{
          totalActiveBookings = todaysBooking.length
          totalSaleAmount= totalSale[0].total
          todaysSale = totayBookingamount[0].total
          todaySaleCount= todaysBookingcount.length
          const reformattedArrayDate =sales.map(x => (x._id).slice(-2));
          const reformattedArrayTotal =sales.map(x => (x.total));
          const reFormattedArrayRoomName = roomSale.map(x  => String(x._id));
          const reFormattedArrayRoomTotal = roomSale.map(x  => (x.total));
      res.render('vendor/sales', {vendor: true,name: req.session.name,sales:sales, totalSaleAmount, totalActiveBookings
      ,todaysSale,todaySaleCount,reformattedArrayDate,reformattedArrayTotal,reFormattedArrayRoomTotal,reFormattedArrayRoomName})
      console.log(sales);
      console.log(totalSaleAmount);
      console.log("ytyty") 
    
    console.log(reFormattedArrayRoomName)
    console.log(reFormattedArrayRoomTotal)
    })
  })
  })
})
      })
})
  }
  catch(e) {
      console.log(e)
  }

})

router.get('/sales-details-report/:id', async(req,res)=>{
  try{
    date= req.params.id
    const sales= await vendorHelper.getSaleOnAday(req.session.vendorEmail, date)
    res.render('vendor/booking-on-day', {sales,vendor:true,name: req.session.name,}) 

  }
  catch(e) {
      console.log(e)
  }

})

router.get('/edit-room/:id',async (req,res)=>{
  try{
    id= mongoose.Types.ObjectId(req.params.id)
    const categories=adminHelper.getCategory()
      const roomupdate = await vendorHelper.roomUpdate({$match:{role:"vendor"}},{ $unwind : "$rooms"},{$match:{'rooms._id': id}})
      roomupdateDetails = roomupdate[0]
      res.render('vendor/edit-room',{vendor:true,name: req.session.name, categories,roomupdateDetails})
      console.log("yyyy");
  }

  catch(e){

  }
})

router.get('/users',async (req,res)=>{
  try{
    const allUsers= await adminHelper.getAllUsers()
    res.render('vendor/users',{vendor: true, allUsers})
  }
  catch(e) {
      console.log(e)
  }

})

module.exports = router;
