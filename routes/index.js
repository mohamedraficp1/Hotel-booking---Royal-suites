var express = require('express');
const passport = require('passport');
var router = express.Router();
const adminHelper= require('../helpers/adminHelper');
const userHelper = require('../helpers/userHelper')
const { addRoom } = require('../helpers/vendorHelper');
const mongoose= require('mongoose');
const { cancelOrder } = require('../helpers/userHelper');
const mailer = require('../config/email')
const { response } = require('../app');
const store= require('../config/multer')
var Sms =require('../config/verify');
var moment= require('moment')
require('../config/outh')

let totalAmountPaid = 0
let roomfilterData
function isLoggedIn(req,res, next) {
  req.user ? next() : res.sendStatus(401)
}

function isUserLoggedIn(req,res, next) {
  req.session.userloggedIn ? next() : res.redirect('/login')
}

/* GET home page. */
router.get('/', function(req, res, next) {
  adminHelper.getAllRoom().then((response)=>{
   userHelper.getlatestBanner().then((data)=>{
    console.log(req.session.name);
    console.log("tttt");
    const length= data.length
    console.log(data[length-1]);
  // res.render('user/index', { users: true,response:response,usName:req.session.userName });
  res.render('user/index', { users: true,data:data[length-1],response:response,name:req.session.userName,pic:req.session.photo, profileName:req.session.user });
})
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

router.post('/booking-login', function(req, res, next) {
  userHelper.doLogin(req.body).then((resp)=>{
    if(resp.status){
      req.session.userloggedIn = true;
      req.session.user = resp.user
      req.session.phone=resp.phone
      req.session.email=resp.email
      res.json({response:true})
      
    }
    else if(resp.userErr){
      req.session.userErr= true
      res.json({response:false})
    }
    else {
      req.session.userErr=true
      res.json({response:false})
    }
  })
});

router.post('/update-profile',( req,res)=>{
  userHelper.doprofileUpdate(req.body).then((data)=>{
    res.redirect('/my-profile')
  })
})

router.post('/submit-review',( req,res)=>{
  console.log(req.body);
  console.log("yyyy");
  id= mongoose.Types.ObjectId(req.body.roomid)
  dates = new Date()
  reviewData = {name: req.body.name,date:dates,rating: req.body.rating, content: req.body.content}
  userHelper.addReview(req.body.vendorEmail,id, reviewData).then((data)=>{
     res.json({status:true})
  })
})



router.post('/update-profile-image',store.array('profile-images'), (req,res)=>{
  userHelper.doUpdateImage(req.body.email, req.files).then((data)=>{
    res.redirect('/my-profile')
    console.log("hhhhh")
         console.log(req.body);
  console.log(req.files);
  })

})


router.get('/rooms/:id', (req,res)=> {
  let id= mongoose.Types.ObjectId(req.params.id)
    userHelper.getRoomDetails(id).then((data)=> {
      userHelper.getReview(id).then((totalreviews)=>{
      userHelper.bookedStatus(req.session.email,id).then((bookingStatus)=>{
      console.log(req.session.email);
      console.log("rrrr");
      console.log(id)
      
      let count = bookingStatus.length
      count >0 ? reviewStatus = true : reviewStatus = false
      res.render('user/single-room', { users: true,data: data[0] ,profileName:req.session.user,email: req.session.email,reviewStatus,totalreviews});
      })
    })
        
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

router.get('/searched-rooms',async(req,res)=>{
  roomfilterData= await userHelper.searchdbData()
  console.log("dtatat");
  console.log(roomfilterData);
  res.redirect('/hotel-rooms') 
})

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

router.post('/booking-details',(req,res)=>{
  try{

  userHelper.getBookingDetails(req.session.email).then((response)=>{
    userHelper.getBookingCancelDetails(req.session.email).then((responseData)=>{
      const bookings = response;

      for (const x in bookings) {
        checkIn = new Date(bookings[x].booking.checkInDate).setHours(0, 0, 0, 0);
        checkOut = new Date(bookings[x].booking.checkOutDate).setHours(0, 0, 0, 0);
        const now = new Date().setHours(0, 0, 0, 0);
        if (now >= checkIn && now <= checkOut) {
          bookings[x].isActive = true;
        } else if (now >= checkOut) {
          bookings[x].checkedOut = true;
        } else if (now <= checkIn && now <= checkOut) {
          if (bookings[x].bookingStatus === 'cancelled') {
            bookings[x].cancelled = true;
          } else {
            bookings[x].booking.canCancel = true;
          }
        }
        console.log("jkjk");
      console.log(bookings);
    
      }

      res.render('user/booking-history',{ users: true,profileName:req.session.user,cancelledData:responseData,emailId:req.session.email,data:bookings, phone:req.session.phone})
  })
})
  }catch(e){
    console.log("error");
    console.log(e)
  }
  
})

router.get('/my-profile',isUserLoggedIn,(req,res,next)=>{
  userHelper.getuserDetail(req.session.email).then((datas)=>{
  res.render('user/user-profile',{ users: true,profileName:datas.name,emailId:req.session.email, phone:datas.phoneNumber,address: datas.address, profilepicture: datas.profileImage[0].filename})
  console.log(datas)
  console.log('yyygg');
  })
})

router.post('/search-room',function(req, res) {
  req.session.booking= req.body
  console.log()
  userHelper.getSearchResultRooms(req.body).then((results)=>{
  userHelper.getSearchRoom(req.body).then((datas)=>{
//  /*res.render('user/search-results',{users: true,datas:results, content:req.session.booking,profileName:req.session.user})*/
    res.redirect('/searched-rooms')
    
   
  })
  })
})

router.get('/login',(req,res,next)=>{
  res.render('user/user-login')
})

router.get('/live-chat',(req,res,next)=>{
  res.render('user/chat')
})

router.post('/confirm-delete',(req,res,next)=>{
  let cancelOrder= mongoose.Types.ObjectId(req.body.ids)
  console.log("rrrr")
  console.log(req.body);
  console.log(cancelOrder);
    userHelper.cancelOrder(cancelOrder).then((data)=>{
      res.json({status:true})
    })
})

router.post('/confirmBook',(req,res,next)=>{
  let rids= mongoose.Types.ObjectId(req.session.bookedRoomId)
  let vids= mongoose.Types.ObjectId(req.session.bookedVendorId)
  console.log("hiiiirrr")
  let mailBody ="!!!!Congratulations!!!!...Sir, We are happy to inform that Your Booking has been confirmed, Thank You !!!"
  console.log(rids)
  let roomNo = Number(req.session.booking.rooms)  
  userHelper.getRoomDetails(rids).then((data)=> {
  userHelper.addBooking(req.session.email,req.session.booking.checkIn,req.session.booking.checkOut,roomNo,data[0],totalAmountPaid).then((response)=>{
    mailer.doEmail(req.session.email, "confirmed")
    req.session.totalAmount= totalAmountPaid
    console.log(response);
   console.log('dddd');
   console.log(totalAmountPaid); 
    // res.render('user/confirm-order',{users: true,datas:datas, content:req.session.booking,profileName:req.session.user})
    res.json({status:true})
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
  let amenities=[]
  console.log(amenities)
 

  let {category,wifi,ac,tv,price} = req.body
  console.log(category)
  console.log(ac)
  console.log(tv)
  console.log(price)
  
  for(let i of category){
    filterData.push({'searchResults.rooms.category' :i})
  }

  console.log(filterData);
  let pricedatas;

  let wifiData= {'searchResults.rooms.amenities.wifi':wifi}
  let tvData= {'searchResults.rooms.amenities.tv':tv}
  let acData= {'searchResults.rooms.amenities.ac':ac}
  // let prizeData = {'searchResults.rooms.price':Prize}
  if (wifi){
    amenities.push(wifiData)
  }

  if (tv){
    amenities.push(tvData)
  }

  if (ac){
    amenities.push(acData)
  }

  
  console.log(amenities)
  // let amenities= [wifiData,tvData,acData]
  console.log('revv')
  console.log(amenities)
//   for(let j of vendor){
//     vendorData.push({'rooms.amenities.j' :j})
//   }

//   for(let k of Prize){
//     priceData.push({$lt:{'rooms.price' :k}})
//   }
//   console.log("Dataaaa");
  console.log(amenities.length);
  console.log(filterData.length)

  if(amenities.length && filterData.length){
    userHelper.searchFilter(filterData,amenities).then((respo)=>{
      // console.log("fdjhhkds");
      // console.log(respo)
      // if (price=="hl"){
      //   console.log("hlllll");
      //     respo.sort((a, b) => {
      //       return a.searchResults.rooms.price - b.searchResults.rooms.price;
      //   });
      //   roomfilterData = respo;
      //   res.json({status:true});
      // }
      // else if (price=="lh"){
      //   console.log("lhhhh");
      //   respo.sort((a, b) => {
      //     return b.searchResults.rooms.price - a.searchResults.rooms.price;
      //   });
      //   roomfilterData = respo;
      //   res.json({status:true});
      // }
      // else {
      //   console.log("none");
        roomfilterData = respo;
        // res.json({status:true});
      // }
      
    })
    .catch(function(e) {
      console.error(e.message); 
    })
    
  }

 else if(filterData.length==0 && amenities.length!=0){
    userHelper.searchFilterOne(amenities).then((respo)=>{
    //   console.log("fdjhhkds");
    //   console.log(respo)
    //   if (price=="hl"){
    //     console.log("hlllll");
    //     respo.sort((a, b) => {
    //       return a.searchResults.rooms.price - b.searchResults.rooms.price;
    //   });
    //   roomfilterData = respo;
    //   res.json({status:true});
    // }
    // else if (price=="lh"){
    //   console.log("lhh");
    //   respo.sort((a, b) => {
    //     return b.searchResults.rooms.price - a.searchResults.rooms.price;
    //   });
    //   roomfilterData = respo;
    //   res.json({status:true});
    // }
    // else {
    //   console.log("none");
      roomfilterData = respo;
      // res.json({status:true});
    // }
    })
    .catch(function(e) {
      console.error(e.message); 
    })
  
  }

  else if(amenities.length==0 && filterData.length!=0 ) {
    userHelper.searchFilterOne(filterData).then((respo)=>{
    //   console.log("fdjhhkds");
    //   console.log(respo)
    //   if (price=="hl"){
    //     console.log("hlllll");
    //     respo.sort((a, b) => {
    //       return a.searchResults.rooms.price - b.searchResults.rooms.price;
    //       res.json({status:true})
    //   });
    //   console.log("tthh");
    //   roomfilterData = respo;
    //   console.log(respo[0].searchResults.rooms.price)
    //   res.json({status:true});
    // }
    // else if (price=="lh"){
    //   console.log("lhhh");
    //   respo.sort((a, b) => {
    //     return b.searchResults.rooms.price - a.searchResults.rooms.price;
    //     res.json({status:true})
    //   });
    //   roomfilterData = respo;
    //   console.log("filter2")
    //   console.log(respo[0].searchResults.rooms.price)
    //   console.log(respo)
    //   res.json({status:true});
    // }
    // else {
    //   console.log("none");
      roomfilterData = respo;
      // res.json({status:true});
    // }
    })
    .catch(function(e) {
      console.error(e.message); 
    })
  
  }

  else {
    userHelper.searchdbData().then((respo)=>{
    //   console.log("fdjhhkds");
    //   console.log(respo)
    //   if (price=="hl"){
    //     console.log("hlllll");
    //     respo.sort((a, b) => {
    //       return a.price - b.price;
    //   });
    //   roomfilterData = respo;
    //   res.json({status:true});
    // }
    // else if (price=="lh"){
    //   console.log("hlllll");
    //   respo.sort((a, b) => {
    //     return b.price - a.price;
    //   });
    //   roomfilterData = respo;
    //   res.json({status:true});
    // }
    // else {
    //   console.log("none");
      roomfilterData = respo;
      // res.json({status:true});
    // }
    })
    .catch(function(e) {
      console.error(e.message); 
    })
  }

  if (req.body.price=="hl"){
        console.log("hlllll");
        roomfilterData.sort((a, b) => a.searchResults.rooms.price - b.searchResults.rooms.price);
        res.json({status:true});
    }
    else if (req.body.price=="lh"){
      console.log("hlllll");
      roomfilterData.sort((a, b) => b.searchResults.rooms.price - a.searchResults.rooms.price);
      res.json({status:true});
    }
    else {
      res.json({status:true});
    }
  
  
})

  router.post('/contact-us',async  (req,res)=>{
    try{
      console.log(req.body)
      const message=await adminHelper.messagesFromClient({role:"admin"},{$push:{messages:req.body}})  
      console.log(message)
      res.json({status: true})
    }
    catch(e){
      console.log(e)
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



router.post('/book-room', async function(req, res){
  console.log(req.body)
    req.session.bookedRoomId= req.body.roomID
    console.log("hhhh");
    // console.log(req.session.bookedRoomDetail.roomID);
    let roomNo = Number(req.session.booking.rooms) 
    let roomId= mongoose.Types.ObjectId(req.session.bookedRoomId)
    const roomData= await userHelper.getRoomDetails(roomId)
      const date_1 = new Date(req.session.booking.checkIn);
      const date_2 = new Date(req.session.booking.checkOut);
      let price = Number (roomData[0].rooms.price)
      const difference = date_2.getTime() - date_1.getTime();
      req.session.roomName = roomData[0].rooms.roomName
      req.session.hotelName = roomData[0].hotelName
      console.log("dateeeeee");
      console.log(date_2.getTime());
      console.log(date_1.getTime());
      console.log(difference)
      console.log(roomData)
      const TotalDays = Math.ceil(difference / (1000 * 3600 * 24));
      console.log(TotalDays);
      const days= Number(TotalDays)
      const subtotal= Number(price*roomNo*days)
      const tax=Number(0.18 * subtotal)
      const total=subtotal+tax
      console.log(total)
      totalAmountPaid = total
      req.session.bookedVendorId= roomData._id
      res.render('user/book-now',{users: true,profileName:req.session.user,emailId:req.session.email,tax:tax,totalAmount:total,subtotal:subtotal, roomData:roomData, searchData:req.session.booking})

})

router.post('/pay-now',async function(req, res){
  try{
    const resp = await userHelper.getlastBooking(req.session.email)
    if (resp) {
      let length=resp.length
      orderid=resp[length-1].booking._id
      req.session.order_id = orderid

      if (req.body.options== 'hotel') {
        userHelper.setPayementMode(req.session.order_id).then((rep)=>{
          res.json({hotel: true});
        })

      } else {
        orderAmount = resp[length-1].booking.totalAmount
        userHelper.generateRazorpay(orderid,req.session.totalAmount).then((response)=>{
           console.log(response)
           res.json(response)
        })
      }
    }
  }

  catch(err){
    console.log(err)
  }
 
 
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
          res.json(status);
        });
        console.log(data);
   })
    .catch((err) => {
      console.log(err, 'err');
      res.json({ status: false });
    });
});

router.post('/forgot-password',(req,res,next)=>{
  
  userHelper.forgotPassword(req.body).then((response)=>{
    req.session.forgotNumber=response.phoneNumber
    req.session.forgotEmail= response.email
    res.render('user/forgot-passwordotp')
  })
  
})

router.post('/otp-verify',(req,res)=>{ 
  console.log(req.body);
  const otp = req.body.otp
  const textOtp = Number(otp.join(""));
  const otpData = {otp: textOtp}
  const numdata = {phoneNumber: req.session.forgotNumber}
  Sms.otpVerify(otpData,numdata).then((resp)=>{
    if (resp.valid) {
      res.json({status: true})
   }else{
     res.send('failed verifications')
   }
  
  })
})

router.post('/update-password',(req,res)=>{
  console.log(req.body)
  userHelper.updatePassword(req.session.forgotEmail, req.body.password).then((datas)=>{
    console.log(datas)
    console.log("success");
    res.redirect("/")
  })
})

router.get('/download-invoice',isUserLoggedIn,(req,res,next)=>{
  const today = new Date();
  const year = today.getFullYear();

  const month = (`0${today.getMonth() + 1}`).slice(-2);
  const day = today.getDate();
  const date = (`${year}-${month}-${day}`);
  res.render('user/success',{id:req.session.order_id,amount:req.session.totalAmount,today,roomName:req.session.roomName, checkIn: req.session.booking.checkIn,
  checkOut: req.session.booking.checkOut,profileName:req.session.user,emailId:req.session.email, hotelName:req.session.hotelName})
 
})

router.get('/thank-you',isUserLoggedIn,(req,res,next)=>{
 
  res.render('user/success-page',{users: true,profileName:req.session.user,emailId:req.session.email,})
 
})

router.post('/signup', function(req, res) {
  userHelper.dosignUp(req.body).then((resp)=>{

      if (resp.exist) {
        req.session.userExist= true
        res.redirect('/signup')
      }
      else{
        res.redirect('/')
        req.session.user= req.body.name
        req.session.userloggedIn= true;
      }
  })
 
});

module.exports = router;
