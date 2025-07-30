//create author api app
const exp = require("express");
const authorApp = exp.Router();
const bcryptjs = require("bcryptjs");
const expressAsyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');
const verifyToken = require('../Middlewares/verifyToken')
require("dotenv").config();

let authorscollection;
let articlescollection;

//get authorscollection app
authorApp.use((req, res, next) => {
  authorscollection = req.app.get("authorscollection");
  articlescollection = req.app.get("articlescollection");
  next();
});

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Send verification email function
const sendVerificationEmail = async (email, fullName, userType, verificationToken) => {
    const verificationUrl = `http://localhost:3000/verify-email?token=${verificationToken}`;
    
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'LikhoG - Verify Your Email Address',
        html: `
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; color: white;">
                    <h1 style="margin: 0; font-size: 28px;">Welcome to LikhoG!</h1>
                    <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Please verify your email to get started</p>
                </div>
                
                <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #333; margin-top: 0;">Hello ${fullName}!</h2>
                    <p style="color: #666; line-height: 1.6;">
                        Thank you for registering as an <strong>${userType}</strong> on LikhoG. 
                        To complete your registration and start using your account, please verify your email address by clicking the button below.
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold; font-size: 16px;">
                            Verify Email Address
                        </a>
                    </div>
                    
                    <p style="color: #999; font-size: 14px; line-height: 1.5;">
                        If the button doesn't work, copy and paste this link into your browser:<br>
                        <a href="${verificationUrl}" style="color: #667eea; word-break: break-all;">${verificationUrl}</a>
                    </p>
                    
                    <p style="color: #999; font-size: 14px;">
                        This verification link will expire in 24 hours for security reasons.
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                    
                    <p style="color: #999; font-size: 12px; text-align: center;">
                        If you didn't create an account on LikhoG, you can safely ignore this email.
                    </p>
                </div>
            </div>
        `
    };
    
    return await transporter.sendMail(mailOptions);
};

//author registration route
authorApp.post(
  "/author",
  expressAsyncHandler(async (req, res) => {
    //get author resource from client
    console.log("author registration called")
    const newAuthor = req.body;
    
    //validate required fields
    if (!newAuthor.password || !newAuthor.email || !newAuthor.fullName) {
      return res.status(400).send({ message: "Full name, password, and email are required" });
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newAuthor.email)) {
      return res.status(400).send({ message: "Please enter a valid email address" });
    }
    
    // Auto-generate username from email (part before @)
    const emailUsername = newAuthor.email.split('@')[0];
    let username = emailUsername;
    
    // Check if this username already exists and make it unique if needed
    let counter = 1;
    let existingAuthor = await authorscollection.findOne({ username: username });
    while (existingAuthor !== null) {
      username = `${emailUsername}${counter}`;
      existingAuthor = await authorscollection.findOne({ username: username });
      counter++;
    }
    
    // Assign the unique username
    newAuthor.username = username;
    
    // Check for duplicate email
    const emailExists = await authorscollection.findOne({ email: newAuthor.email });
    if (emailExists !== null) {
      return res.status(400).send({ message: "Email already registered" });
    }
    
    //hash the password
    const hashedPassword = await bcryptjs.hash(newAuthor.password, 6);
    //replace plain pw with hashed pw
    newAuthor.password = hashedPassword;
      
    // Add email verification fields
    newAuthor.isEmailVerified = false;
    newAuthor.emailVerifiedAt = null;
    newAuthor.createdAt = new Date();
    
    //create author
    await authorscollection.insertOne(newAuthor);
      
    // Send verification email
    try {
      // Generate verification token
      const verificationToken = jwt.sign(
          { 
              email: newAuthor.email, 
              username: newAuthor.username,
              userType: 'author' 
          },
          process.env.SECRET_KEY,
          { expiresIn: '24h' }
      );
        
        await sendVerificationEmail(newAuthor.email, newAuthor.fullName, 'author', verificationToken);
        
        //send res
        res.status(201).send({ 
          message: "Account created successfully! Please check your email to verify your account before signing in.",
          emailSent: true
        });
      } catch (emailError) {
        console.error('Error sending verification email:', emailError);
        res.status(201).send({ 
          message: "Account created successfully, but failed to send verification email. Please contact support.",
          emailSent: false
        });
      }
  })
);

//author login
authorApp.post(
  "/login",
  expressAsyncHandler(async (req, res) => {
    //get cred obj from client
    const authorCred = req.body;
    
    //validate required fields
    if (!authorCred.email || !authorCred.password) {
      return res.status(400).send({ message: "Email and password are required" });
    }
    
    //check for author by email
    const dbauthor = await authorscollection.findOne({ email: authorCred.email });
    if (dbauthor === null) {
      res.status(401).send({ message: "Invalid email address" });
    } else {
      //check for password
      const status = await bcryptjs.compare(authorCred.password, dbauthor.password);
      if (status === false) {
        res.status(401).send({ message: "Invalid password" });
      } else {
        // Check if email is verified
        if (!dbauthor.isEmailVerified) {
          return res.status(403).send({ 
            message: "Please verify your email address before logging in. Check your inbox for the verification email.",
            emailVerificationRequired: true
          });
        }
        
        //create jwt token and encode it
        const signedToken = jwt.sign(
          { username: dbauthor.username },
          process.env.SECRET_KEY,
          { expiresIn: '1d' }
        );
        //send res
        res.send({
          message: "login success",
          token: signedToken,
          user: dbauthor,
        });
      }
    }
  })
);

//add article
authorApp.post(
  "/article", verifyToken,
  expressAsyncHandler(async (req, res) => {
    //get new article from client
    const newArticle = req.body;
    //post to articles collection
    await articlescollection.insertOne(newArticle);
    //send response
    res.send({ message: "New article created" });
  })
);

//modify article
authorApp.put(
  "/article", verifyToken,
  expressAsyncHandler(async (req, res) => {
    //get modified article from client
    const modifiedArticle = req.body;
    //update
    let result = await articlescollection.replaceOne(
      { articleId: modifiedArticle.articleId },
      modifiedArticle
    );
    console.log(result);
    res.send({ message: "Article modified" });
  })
);

//soft delete of an article by id
authorApp.put(
  "/article/:articleId", verifyToken,
  expressAsyncHandler(async (req, res) => {
    //get id from url
    const articleIdFromUrl = (+req.params.articleId);
    //update status
    await articlescollection.updateOne(
      { articleId: articleIdFromUrl },
      { $set: { status: false } }
    );
    res.send({ message: "article removed" });
  })
);

//restore soft deleted article
authorApp.put(
  "/article/:articleId/restore", verifyToken,
  expressAsyncHandler(async (req, res) => {
    //get id from url
    const articleIdFromUrl = (+req.params.articleId);
    //update status
    await articlescollection.updateOne(
      { articleId: articleIdFromUrl },
      { $set: { status: true } }
    );
    res.send({ message: "article restored" });
  })
);

//get articles by author username
authorApp.get(
  "/articles/:username", verifyToken,
  expressAsyncHandler(async (req, res) => {
    //get author name from url
    const authorName = req.params.username;
    //get all articles of a particular author
    let articlesList = await articlescollection
      .find({ username: authorName })
      .toArray();
    
    // Enrich articles with author full name
    const author = await authorscollection.findOne({ username: authorName });
    const enrichedArticles = articlesList.map(article => ({
      ...article,
      authorFullName: author ? author.fullName : authorName
    }));
    
    //send response
    res.send({ message: "articles list", payload: enrichedArticles });
  })
);

//export authorApp
module.exports = authorApp;



