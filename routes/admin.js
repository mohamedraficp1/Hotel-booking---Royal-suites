var express = require('express');
var router = express.Router();
var Admin= require('../public/models/admin')
const adminHelper= require("../public/helpers/adminHelper");
const async = require('hbs/lib/async');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('admin/admin', { admin: true });
});

router.get('/login', function(req, res, next) {
  res.render('admin/admin-login', { admin: true });
});

router.post('/login', function(req, res) {
    
});



// async function run() {
//   const admin= await Admin.create({email: "admin@royals.com", password:"$2a$10$du5LkR8gyq8fo13yTOZ54OwpQG1mNND.RNI0JZdmdnvzintVr4oFe"})
//   await admin.save
//   console.log(admin)
// }
// run()


module.exports = router;
