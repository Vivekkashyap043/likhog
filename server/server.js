//create express app
const express = require('express');
const app = express();
require('dotenv').config() 
// Log key environment variables (sanitized) to help debug email/SERVER config
console.log('Server starting with env:', {
    PORT: process.env.PORT || 5000,
    DB_URL_set: !!process.env.DB_URL,
    FRONTEND_URL: process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:3000',
    EMAIL_HOST: process.env.EMAIL_HOST || process.env.SMTP_HOST || (process.env.EMAIL_USER ? 'gmail (default)' : 'not-set'),
    EMAIL_PORT: process.env.EMAIL_PORT || process.env.SMTP_PORT || 'not-set',
    EMAIL_USER_set: !!(process.env.EMAIL_USER || process.env.EMAIL_USERNAME)
});
const mongoClient=require('mongodb').MongoClient;
const path=require('path')
const cors = require('cors')

app.use(cors())
//to parse the body of req
app.use(express.json())

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

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../client/build')));

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
// SPA Fallback: serve index.html for any unknown route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

//assign port number
const port=process.env.PORT || 5000;
app.listen(port,()=>console.log(`Server is running on port ${port}`))