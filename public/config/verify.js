const client = require('twilio')('AC1771c44d73f01a6a895be8eeb56b103f', 'ff24b7bc240cf38d8d18c7efaf48d157');
const VERIFY_SERVICE_SID = 'VAc6bee50ae4915c4427c2a953a50e31db';
module.exports={
  sentSms: (userData)=>{client.verify
      .services(VERIFY_SERVICE_SID)
      .verifications.create({ to: `+91${9746790834}`, channel: "sms" })
      .then((verification) => {
        console.log(verification.status);
        return callback(null);
      })
      .catch((e) => {
        console.log(e);
        return callback(e);
      });
    }
  }
 
  