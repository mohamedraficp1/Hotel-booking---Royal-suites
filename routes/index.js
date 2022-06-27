var express = require('express');
const passport = require('passport');
var router = express.Router();
const adminHelper= require('../helpers/adminHelper');
const userHelper = require('../helpers/userHelper')
const { addRoom } = require('../helpers/vendorHelper');
const mongoose= require('mongoose')
require('../config/outh')

function isLoggedIn(req,res, next) {
  req.user ? next() : res.sendStatus(401)
}
/* GET home page. */
router.get('/', function(req, res, next) {
  adminHelper.getAllRoom().then((response)=>{
  // res.render('user/index', { users: true,response:response,usName:req.session.userName });
  res.render('user/index', { users: true,response:response,name:req.session.userName,pic:req.session.photo });
  
});
});


router.get('/rooms/:id', (req,res)=> {
  let id= mongoose.Types.ObjectId(req.params.id)
    userHelper.getRoomDetails(id).then((data)=> {
      res.render('user/single-room', { users: true,data: data[0] });
    })
    
})

router.get('/rooms', isLoggedIn, function(req, res, next) {
  adminHelper.getAllRoom().then((response)=>{
    // res.send(`hello ${req.user.displayName}`);
    req.session.userName = req.user.displayName                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
    req.session.photo=req.user.photos[0].value,
    req.session.userLogged= true;
    res.render('user/rooms', { users: true,response:response ,name:req.session.userName,pic:req.session.photo});
    console.log('CHECK')                                                                                                                                                    
    console.log(req.session.userName)
    console.log('CHECK')
    
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

router.get ('/logout',(req,res)=> {
    // req.session.userName = null;
    // req.session.userLogged= false;
    req.logOut(function(err) {
      if (err) { return next(err); }
    req.session.destroy();
    res.redirect('/')
})})

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

module.exports = router;
