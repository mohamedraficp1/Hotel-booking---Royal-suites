const multer = require('multer');
const path = require('path');
const sharp = require('sharp');

/* File upload*/
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/images/banner-images');
    },
  
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
  });
  
  module.exports = store = multer({ storage: storage })
  