var db= require('../config/connections')

module.exports={
    doLogin: (userData)=>{
        return new Promise(async(resolve,reject)=>{
          let loginStatus=false 
          let admindetail=await db.get().collection(admins).findOne({email: userData.email}) 
          if(user){
              bcrypt.compare(userData.password,admindetail.password).then((status)=>{
                  
                  if(status){
                      console.log("Login success")
                      response.user = user;
                      response.status=true;
                      resolve(response)
                  }else{
                    
                    console.log("Login failed")
                    response.status=false
                    response.userErr=true
                      resolve(response) ;
                  }
              })
              
          }
          else{
            response.status=false
            response.paswdErr=true
            console.log("login failed")
            resolve(response) ;
        }
    
       }) 
    }
}
