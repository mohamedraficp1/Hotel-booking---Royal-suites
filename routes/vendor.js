var express = require('express');
const adminHelper = require('../public/helpers/adminHelper');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('vendor/vendor', { admin: true });
});

router.get('/signup', function(req, res, next) {
  res.render('vendor/vendor-signup', { admin: true });
});

router.get('/login', function(req, res, next) {
  res.render('vendor/vendor-login', { admin: true });
});

router.post('/signup', function(req,res) {
  adminHelper.doSignup(req.body).then((data)=>{
    if (data) {
      req.session.VendorloggedIn = true;
      res.redirect('/vendor')
    }
  })
  
});




module.exports = router;
