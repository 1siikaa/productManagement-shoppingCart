const jwt=require("jsonwebtoken")
const { isValidObjectId } = require("mongoose")

//........................................................... Authentication ...............................................

const authentication=async function(req,res,next){
try{    let token=req.headers["authorization"]

    if(!token){
        return res.status(400).send({status:false,message:"token is not present"})
    }
    token=token.split(" ") 
    jwt.verify(token[1],"project/productManagementGroup8",(error,decodedToken)=>{
      if(error) {
         const msg=error.message==="jwt expired"?"JWT is expired": "Invalid JWT"
        return res.status(401).send({status:false,message:msg})
      }
      req.decodedToken = decodedToken
      next()
    })
  }
  catch(error){
    return res.status(500).send({status:false,message:error.message})
  }
}

// .............................................................. Authorization ...................................................................


const authorization=async function(req,res,next){
  try{
    const userId=req.params.userId
    if(!userId){
        return res.status(400).send({status:false, message:"important" })
    }
    const decodedToken=req.decodedToken
    if(!isValidObjectId(userId)){
     
      return res.status(400).send({status:false,msg:"user id is not valid"}) 
    }
    if(!await userModel.findById({_id:userId})){
    return res.status(400).send({status:false, message:"this user does not exist."})
    }
    if(decodedToken.id!==userId){
      
      return res.status(403).send({status:false,message:" not authorized user"})
    }
    
    next()
  }
  catch(error){
    return res.status(500).send({status:false,message:error,message})
  }
}

module.exports={
  authentication,authorization
}