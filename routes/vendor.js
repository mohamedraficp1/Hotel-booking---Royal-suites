var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('vendor/vendor', { admin: true });
});

router.get('/signup', function(req, res, next) {
  res.render('vendor/vendor-signup', { admin: true });
});




module.exports = router;
