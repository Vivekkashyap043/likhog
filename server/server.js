//create express app
const exp=require('express');
const app=exp()
require('dotenv').config() 
const mongoClient=require('mongodb').MongoClient;
//const path=require('path')
const cors = require('cors')

app.use(cors())
//to parse the body of req
app.use(exp.json())

//connect to DB
mongoClient.connect(process.env.DB_URL)
.then(client=>{
    //get db obj
    const blogdb=client.db('blogdb')
    //get collection obj
    const userscollection=blogdb.collection('userscollection')
    const articlescollection=blogdb.collection('articlescollection')
    const authorscollection=blogdb.collection('authorscollection')
    //share colelction obj with express app
    app.set('userscollection',userscollection)
    app.set('articlescollection',articlescollection)
    app.set('authorscollection',authorscollection)
    //confirm db connection status
    console.log("Database connection successful")
})
.catch(err=>console.log("Error in Database connection", err))


//import API routes
const userApp=require('./APIs/user-api')
const authorApp=require('./APIs/author-api')
const adminApp=require('./APIs/admin-api')
const commonApp=require('./APIs/common-api')

//if path starts with user-api, send req to userApp
app.use('/user-api', userApp)
//if path starts with author-api, send req to authorApp
app.use('/author-api',authorApp)
//if path starts with admin-api, send req adminApp
app.use('/admin-api',adminApp)
//if path starts with common-api, send req to commonApp
app.use('/common-api',commonApp)

//express error handler
app.use((err,req,res,next)=>{
    res.send({message:"error",payload:err.message})
})
//assign port number
const port=process.env.PORT || 4000;
app.listen(port,()=>console.log(`Server is running on port ${port}`))