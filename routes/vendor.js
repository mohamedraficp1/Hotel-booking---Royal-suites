var express = require('express');
const adminHelper = require('../public/helpers/adminHelper');
var router = express.Router();
var sms =require('../public/config/verify')

/* GET users listing. */
router.get('/', function(req, res, next) {
  sms.sentSms()
  res.render('vendor/vendor', { admin: true });

});

router.get('/signup', function(req, res, next) {
  res.render('vendor/vendor-signup', { admin: true });
});

router.get('/login', function(req, res, next) {
  res.render('vendor/vendor-login', { admin: true });
});

router.get('/verifyNumber', function(req, res, next) {
  res.render('vendor/verify-number', { admin: true });
});

router.post('/add-room', function(req,res) {
  console.log(req.body);
})

router.post('/signup', function(req,res) {
  adminHelper.doSignup(req.body).then((data)=>{
    if (data) {
      req.session.VendorloggedIn = true;
      res.redirect('/vendor')
    }
  })
  
});




module.exports = router;
