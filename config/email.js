require('dotenv').config()
const nodemailer = require("nodemailer");

module.exports = {
  doEmail: (mail, content) => {
    const transporter = nodemailer.createTransport({
      service: "hotmail",
      auth: {
        user: process.env.NODE_MAILER_USERNAMRE,
        pass: process.env.NODE_MAILER_PASSWORD,
      },
    });
    const options = {
      from: "royalsuites01@outlook.com",
      to: mail,
      subject: "Room Booking",
      text: "!!!!Congratulations!!!!...Sir, We are happy to inform that Your Booking has been"+ content+ ", Thank You !!!",
    };

    transporter.sendMail(options, function (err, info) {
      if (err) {
        console.log(err);
        return;
      }
      console.log("Sent :" + info.response);
    });
  },
};

// const nodemailer = require('nodemailer');
// const mailTransporter = nodemailer.createTransport({
//     host: "hotmail",
//     auth: {
//         user: 'quickdocbooking@outlook.com',
//         pass: 'Lmea17me089'
//     }
// });

// let mailDetails =  {
// from: 'quickdocbooking@outlook.com',
// to: 'mohamedraficp@gmail.com',
// subject: 'Test mail',
// text: 'This'
// };

// module.exports = {
//     doEmail:(emailData)=>{

//         // //testing success
//         mailTransporter.verify((error,success)=>{
//                 if(error){
//                     console.log(error);
//                 }else{
//                     console.log('outlook connection established');
//                 }
//             })

//         mailTransporter.sendMail(mailDetails, function(err, data) {
//             console.log('dedded');
//             if(err) {
//                 console.log(err);

//             } else {
//                 console.log('Email sent successfully');

//             }
//         });

//     }

// }
