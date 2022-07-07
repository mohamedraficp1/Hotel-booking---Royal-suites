var express = require('express');
const passport = require('passport');
var router = express.Router();
const adminHelper= require('../helpers/adminHelper');
const userHelper = require('../helpers/userHelper')
const { addRoom } = require('../helpers/vendorHelper');
const mongoose= require('mongoose');
const { cancelOrder } = require('../helpers/userHelper');
const { response } = require('../app');
require('../config/outh')

let roomfilterData = []
function isLoggedIn(req,res, next) {
  req.user ? next() : res.sendStatus(401)
}

function isUsedLoggedIn(req,res, next) {
  req.session.userloggedIn ? next() : res.redirect('/login')
}

/* GET home page. */
router.get('/', function(req, res, next) {
  adminHelper.getAllRoom().then((response)=>{
   
    console.log(req.session.name);
  // res.render('user/index', { users: true,response:response,usName:req.session.userName });
  res.render('user/index', { users: true,response:response,name:req.session.userName,pic:req.session.photo, profileName:req.session.user });
  
});
});

router.post('/login', function(req, res, next) {
  userHelper.doLogin(req.body).then((resp)=>{
    if(resp.status){
      req.session.userloggedIn = true;
      req.session.user = resp.user
      req.session.phone=resp.phone
      req.session.email=resp.email
     console.log("id")
      console.log(mongoose.Types.ObjectId(req.session.id._id))
      res.redirect('/')
      
    }
    else if(resp.userErr){
      req.session.userErr= true
      res.redirect('/login')
    }
    else {
      req.session.userErr=true
      res.redirect('/login')
    }
  })
});


router.get('/rooms/:id', (req,res)=> {
  let id= mongoose.Types.ObjectId(req.params.id)
    userHelper.getRoomDetails(id).then((data)=> {
      res.render('user/single-room', { users: true,data: data[0] });
    })
    
})

// router.get('/rooms', isLoggedIn, function(req, res, next) {
//   adminHelper.getCategory().then((data)=>{
//   adminHelper.getAllRoom().then((response)=>{
//     adminHelper.getApprovedVendors().then((vendorData)=>{
//     // res.send(`hello ${req.user.displayName}`);
//     req.session.userName = req.user.displayName                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
//     req.session.photo=req.user.photos[0].value,
   
//     // req.session.userLogged= true;
//     res.render('user/rooms', { users: true, roomfilterData:roomfilterData,  response:response ,userName: req.session.user,name:req.session.userName,pic:req.session.photo, data:data,vendorData:vendorData});
//     console.log('CHECK')                                                                                                                                                    
//     console.log(req.session.userName)
//     console.log('CHECK')
//   });  
// }) 
// });
// });

router.get('/hotel-rooms',  function(req, res, next) {
  adminHelper.getCategory().then((data)=>{
  adminHelper.getAllRoom().then((response)=>{
    adminHelper.getApprovedVendors().then((vendorData)=>{
    // res.send(`hello ${req.user.displayName}`);
    // req.session.userName = req.user.displayName                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
    // req.session.photo=req.user.photos[0].value,
   
    // req.session.userLogged= true;
    res.render('user/rooms', { users: true, roomfilterData:roomfilterData,  response:response ,userName: req.session.user,name:req.session.user, data:data,vendorData:vendorData});
    
  });  
}) 
});
});

router.get('/auth/google',
  passport.authenticate('google',{scope: ['email', 'profile']})
)

router.get('/google/callback',
  passport.authenticate('google',{
  successRedirect: '/rooms',
  failureRedirect: '/auth/failure',
  })
)

router.get('/auth/failure', function(req, res, next) {
  res.send('Some thing went wrong');
});

router.get('/signup',(req,res,next)=>{
  res.render('user/user-signup')
})

router.post('/booking-details',isUsedLoggedIn,(req,res,next)=>{
  userHelper.getBookingDetails(req.session.email).then((response)=>{
    userHelper.getBookingCancelDetails(req.session.email).then((responseData)=>{
    res.render('user/booking-history',{ users: true,profileName:req.session.user,cancelledData:responseData,emailId:req.session.email,data:response, phone:req.session.phone})
  })
})
  
})

router.get('/my-profile',(req,res,next)=>{
  res.render('user/user-profile',{ users: true,profileName:req.session.user,emailId:req.session.email, phone:req.session.phone})
})

router.post('/search-room',function(req, res) {
  req.session.booking= req.body
  console.log()
  userHelper.getSearchRoom(req.body).then((datas)=>{
    res.render('user/search-results',{users: true,datas:datas, content:req.session.booking,profileName:req.session.user})
  })
})

router.get('/login',(req,res,next)=>{
  res.render('user/user-login')
})

router.get('/cancel-order/:id',(req,res,next)=>{
  let cancelOrder= mongoose.Types.ObjectId(req.params.id)
  console.log("rrrr")
  console.log(cancelOrder);
    userHelper.cancelOrder(cancelOrder).then((data)=>{
      res.redirect('/my-profile')
    })
})

router.post('/confirmBook',(req,res,next)=>{
  let rids= mongoose.Types.ObjectId(req.session.bookedRoomId)
  let vids= mongoose.Types.ObjectId(req.session.bookedVendorId)
  console.log("hiiiirrr")
  console.log(rids)
  let roomNo = Number(req.session.booking.rooms)  
  userHelper.getRoomDetails(rids).then((data)=> {
  userHelper.addBooking(req.session.email,req.session.booking.checkIn,req.session.booking.checkOut,roomNo,data[0]).then((datas)=>{
    console.log('datas')
    console.log(datas)
    res.render('user/confirm-order',{users: true,datas:datas, content:req.session.booking,profileName:req.session.user})
  })
})
})

router.get ('/logout',(req,res)=> {
    // req.session.userName = null;
    // req.session.userLogged= false;
    req.logOut(function(err) {
      if (err) { return next(err); }
    req.session.destroy();
    res.redirect('/')
})})

router.post('/search-filter',(req,res)=>{
  console.log('reult;....');
  console.log(req.body)
  let filterData=[]
  let vendorData=[]
  let priceData=[]

  let {category,wifi,ac,tv} = req.body
  console.log(category)
  console.log(ac)
  console.log(tv)
  
  for(let i of category){
    filterData.push({'rooms.category' :i})
  }

  let wifiData= {'rooms.amenities.wifi':wifi}
  let tvData= {'rooms.amenities.tv':tv}
  let acData= {'rooms.amenities.ac':ac}
  let amenities= [...filterData,wifiData,tvData,acData]
  console.log('revv')
  console.log(amenities)
//   for(let j of vendor){
//     vendorData.push({'rooms.amenities.j' :j})
//   }

//   for(let k of Prize){
//     priceData.push({$lt:{'rooms.price' :k}})
//   }
//   console.log("Dataaaa");
//   console.log(filterData);
//   console.log(vendorData)
console.log(amenities.length);
  if(amenities.length){
     userHelper.searchFilter(amenities).then((respo)=>{
    console.log(respo);
    console.log("ttt");
    roomfilterData = respo;
    console.log(roomfilterData);
    res.json({status:true});
  })
 
  }
  else {
    adminHelper.getAllRoom().then((response)=>{
      roomfilterData = response;
      res.json({status:true});
    })
  }
 
  })

// router.route('/logout')
//     .get((req, res) => {
//           req.logout(function(err) {
//                if (err) { return next(err); }
//            res.redirect('/');
//       });
//   });

// router.get('/logout', (req, res) => {
//   req.session = null;
//   req.logout();
//   res.redirect('/');
// })



router.post('/book-room', function(req, res){
  console.log(req.body)
  req.session.bookedRoomId= req.body.roomID
  // console.log("hhhh");
  // console.log(req.session.bookedRoomDetail.roomID);
  let roomNo = Number(req.session.booking.rooms) 
  let roomId= mongoose.Types.ObjectId(req.session.bookedRoomId)
  userHelper.getRoomDetails(roomId).then((roomData)=>{
    let price = Number (roomData[0].rooms.price)
    let subtotal= Number(price*roomNo)
    let tax=Number(0.18 * subtotal)
    let total=subtotal+tax
    console.log(total)
    req.session.bookedVendorId= roomData._id
    res.render('user/book-now',{users: true,profileName:req.session.user,emailId:req.session.email,tax:tax,totalAmount:total,subtotal:subtotal, roomData:roomData, searchData:req.session.booking})
  })
})

router.post('/pay-now',function(req, res){
 userHelper.getBookingDetails(req.session.email).then((resp)=>{
 
  let length=resp.length
   orderid=resp[length-1].booking._id
   userHelper.generateRazorpay(orderid).then((response)=>{
      console.log(response)
      res.json(response)
   })
 })
})

router.post('/verify-payment', (req, res) => {
  console.log(req.body);
  userHelper.verifyPayment(req.body)
    .then((data) => {
  userHelper.changePaymentStatus(
          req.body['order[receipt]']
        )
        .then((status) => {
          console.log('Payement Sucess');
          res.json({ status: true });
        });
        console.log(data);
   })
    .catch((err) => {
      console.log(err, 'err');
      res.json({ status: false });
    });
});

router.post('/signup', function(req, res) {
  userHelper.dosignUp(req.body).then((resp)=>{

      if (resp.exist) {
        req.session.userExist= true
        res.redirect('/signup')
      }
      else{
        res.redirect('/')
        req.session.user= req.body.name
        req.session.userLogged= true;
      }
  })
 
});

module.exports = router;
