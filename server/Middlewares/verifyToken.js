const jwt=require('jsonwebtoken')
require('dotenv').config()

function verifyToken(req,res,next){
    //get bearer token from headers of req
    const bearerToken=req.headers.authorization;
  //  console.log(bearerToken)
    //if bearer token not available
    if(!bearerToken){
        return res.status(401).send({message:"Unauthorized access. Please login to continue"})
    }
    //extract token from bearer token
    const token=bearerToken.split(' ')[1]
   // console.log(token)
    try{
        const decoded = jwt.verify(token,process.env.SECRET_KEY)
        // Set the username from the decoded token
        req.username = decoded.username;
        next()
    }catch(err){
        return res.status(401).send({message:"Invalid or expired token. Please login again"})
    }
}


module.exports=verifyToken;