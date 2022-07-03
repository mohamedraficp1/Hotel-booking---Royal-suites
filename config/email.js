
 

const nodemailer=require('nodemailer')





const transporter=nodemailer.createTransport({

    service: "hotmail",
    auth :{
        user:"royalsuites01@outlook.com",
        pass: "Royal@123"
        
    }
});

const options={

    from: "royalsuites01@outlook.com",
    to: "mohamedraficp@gmail.com",
    subject:"Hospital Rgistratoin",
    text:"!!!!Congratulations!!!!...Sir, We are happy to inform that Your hospital registration is aproved, Please contact our team immediately, Thank You !!!"
}

module.exports ={


doEmail:()=>{


transporter.sendMail(options, function(err,info){

    if(err){
        console.log(err)
        return
    }
    console.log("Sent :"+ info.response);
})

},



}

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