const client = require('twilio')('AC1771c44d73f01a6a895be8eeb56b103f', 'ff24b7bc240cf38d8d18c7efaf48d157');
const serviceSid = 'VAc6bee50ae4915c4427c2a953a50e31db';

module.exports ={
    doSms:(noData)=>{
        let res = {}
        return new Promise(async(resolve,reject)=>{
            client.verify.services(serviceSid).verifications.create({
                to : `+91${noData.phoneNumber}`,
                channel:"sms"
            }).then((res)=>{
                res.valid =false
                resolve(res)
                console.log(res);
            })
        })
    },
    otpVerify:(otpData,nuData)=>{
        let resp = {}
        return new Promise(async(resolve,reject)=>{
            client.verify.services(serviceSid).verificationChecks.create({
                to: `+91${nuData.phoneNumber}`,
                code: otpData.otp
            }).then((resp)=>{
                
                console.log('verification failed');
                console.log(resp);
                resolve(resp)
            })
        })
    },
    adminLogin:()=>{
        let res = {}
        return new Promise(async(resolve,reject)=>{
            client.verify.services(serviceSid).verifications.create({
                to : `+91${9746790834}`,
                channel:"sms"
            }).then((res)=>{
                res.valid =false
                resolve(res)
                console.log(res);
            })
        })
    },
    otpAdminVerify:(otpData)=>{
        let resp = {}
        return new Promise(async(resolve,reject)=>{
            client.verify.services(serviceSid).verificationChecks.create({
                to: `+91${9746790834}`,
                code: otpData.otp
            }).then((resp)=>{
                console.log('verification failed');
                console.log(resp);
                resolve(resp)
            })
        })
    }
}
 
  