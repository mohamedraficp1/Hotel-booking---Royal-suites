var express = require('express');
const passport = require('passport');
var router = express.Router();
const adminHelper= require('../helpers/adminHelper');
const userHelper = require('../helpers/userHelper')
const { addRoom } = require('../helpers/vendorHelper');
const mongoose= require('mongoose')
require('../config/outh')

let roomfilterData = []
function isLoggedIn(req,res, next) {
  req.user ? next() : res.sendStatus(401)
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
      req.session.id=resp.id
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

router.get('/rooms', isLoggedIn, function(req, res, next) {
  adminHelper.getCategory().then((data)=>{
  adminHelper.getAllRoom().then((response)=>{
    adminHelper.getApprovedVendors().then((vendorData)=>{
    // res.send(`hello ${req.user.displayName}`);
    req.session.userName = req.user.displayName                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
    req.session.photo=req.user.photos[0].value,
   
    // req.session.userLogged= true;
    res.render('user/rooms', { users: true, roomfilterData:roomfilterData,  response:response ,userName: req.session.user,name:req.session.userName,pic:req.session.photo, data:data,vendorData:vendorData});
    console.log('CHECK')                                                                                                                                                    
    console.log(req.session.userName)
    console.log('CHECK')
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

router.get('/my-profile',(req,res,next)=>{
  res.render('user/user-profile')
})

router.post('/search-room',function(req, res) {
  req.session.booking= req.body
  console.log()
  userHelper.getSearchRoom(req.body).then((datas)=>{
    res.render('user/search-results',{datas:datas, content:req.session.booking,profileName:req.session.user})
  })
})

router.get('/login',(req,res,next)=>{
  res.render('user/user-login')
})

router.post('/confirmBook',(req,res,next)=>{
  console.log("ids nkitty");
  console.log(req.session.id);
  let rids= mongoose.Types.ObjectId(req.session.bookedRoomId)
  let vids= mongoose.Types.ObjectId(req.session.bookedVendorId)
  console.log(rids);
  console.log(vids);
  let roomNo = Number(req.session.booking.rooms)  
  userHelper.addBooking(req.session.email,req.session.booking.checkIn,req.session.booking.checkOut,roomNo,rids,vids).then((datas)=>{
    console.log('datas')
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

  let {category,vendor,Prize} = req.body
  for(let i of category){
    filterData.push({'rooms.category' :i})
  }
console.log(filterData);
  userHelper.searchFilter(filterData).then((respo)=>{
    console.log(respo);
    roomfilterData = respo;
    res.redirect('/rooms')
    res.json({status:true});
  })
   
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
  let roomId= mongoose.Types.ObjectId(req.session.bookedRoomId)
  userHelper.getRoomDetails(roomId).then((roomData)=>{
    req.session.bookedVendorId= roomData._id
    res.render('user/book-now',{users: true,profileName:req.session.user,emailId:req.session.email, roomData:roomData, searchData:req.session.booking})
  })
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
        req.session.userLogged= true;
      }
  })
 
});

module.exports = router;
