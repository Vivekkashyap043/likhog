//create user api app
const exp = require("express");
const userApp = exp.Router();
const bcryptjs = require("bcryptjs");
const expressAsyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');
const verifyToken = require('../Middlewares/verifyToken')
require("dotenv").config();

let use      // Check in users collection first
      let user = await usercollection.findOne({ username: username });
      if (user) {
        return res.send({
          fullName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || username.split('@')[0],
          userType: 'user'
        });
      }
      
      // Check in authors collection
      const authorscollection = req.app.get("authorscollection");
      user = await authorscollection.findOne({ username: username });
      if (user) {
        return res.send({
          fullName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || username.split('@')[0],
          userType: 'author'
        });
      }articlescollection;
//get usercollection app
userApp.use((req, res, next) => {
  usercollection = req.app.get("userscollection");
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
    const frontendUrl = process.env.FRONTEND_URL || 'https://likhog.onrender.com';
    const verificationUrl = `${frontendUrl}/verify-email?token=${verificationToken}`;
    
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
                        Thank you for registering as a <strong>${userType}</strong> on LikhoG. 
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

//user registration route
userApp.post(
  "/user",
  expressAsyncHandler(async (req, res) => {
    //get user resource from client
    console.log("registration called")
    const newUser = req.body;
    
    //validate required fields
    if (!newUser.password || !newUser.email || !newUser.fullName) {
      return res.status(400).send({ message: "Full name, password, and email are required" });
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUser.email)) {
      return res.status(400).send({ message: "Please enter a valid email address" });
    }
    
    // Auto-generate username from email (part before @)
    const emailUsername = newUser.email.split('@')[0];
    let username = emailUsername;
    
    // Check if this username already exists and make it unique if needed
    let counter = 1;
    let existingUser = await usercollection.findOne({ username: username });
    while (existingUser !== null) {
      username = `${emailUsername}${counter}`;
      existingUser = await usercollection.findOne({ username: username });
      counter++;
    }
    
    // Assign the unique username
    newUser.username = username;
    
    // Check for duplicate email
    const emailExists = await usercollection.findOne({ email: newUser.email });
    if (emailExists !== null) {
      return res.status(400).send({ message: "Email already registered" });
    }
    
    //hash the password
    const hashedPassword = await bcryptjs.hash(newUser.password, 6);
    //replace plain pw with hashed pw
    newUser.password = hashedPassword;
      
    // Add email verification fields
    newUser.isEmailVerified = false;
    newUser.emailVerifiedAt = null;
    newUser.createdAt = new Date();
    
    //create user
    await usercollection.insertOne(newUser);
      
    // Send verification email
    try {
      // Generate verification token
      const verificationToken = jwt.sign(
          { 
              email: newUser.email, 
              username: newUser.username,
              userType: 'user' 
          },
          process.env.SECRET_KEY,
          { expiresIn: '24h' }
      );
        
        await sendVerificationEmail(newUser.email, newUser.fullName, 'user', verificationToken);
        
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

//user login
userApp.post(
  "/login",
  expressAsyncHandler(async (req, res) => {
    //get cred obj from client
    const userCred = req.body;
    
    //validate required fields
    if (!userCred.email || !userCred.password) {
      return res.status(400).send({ message: "Email and password are required" });
    }
    
    //check for user by email
    const dbuser = await usercollection.findOne({ email: userCred.email });
    if (dbuser === null) {
      res.status(401).send({ message: "Invalid email address" });
    } else {
      //check for password
      const status = await bcryptjs.compare(userCred.password, dbuser.password);
      if (status === false) {
        res.status(401).send({ message: "Invalid password" });
      } else {
        // Check if email is verified
        if (!dbuser.isEmailVerified) {
          return res.status(403).send({ 
            message: "Please verify your email address before logging in. Check your inbox for the verification email.",
            emailVerificationRequired: true
          });
        }
        
        //create jwt token and encode it
        const signedToken = jwt.sign(
          { username: dbuser.username },
          process.env.SECRET_KEY,
          { expiresIn: '1d' }
        );
        //send res
        res.send({
          message: "login success",
          token: signedToken,
          user: dbuser,
        });
      }
    }
  })
);

//get articles of all authors
userApp.get(
  "/articles", verifyToken,
  expressAsyncHandler(async (req, res) => {
    //get articlescollection from express app
    const articlescollection = req.app.get("articlescollection");
    const authorscollection = req.app.get("authorscollection");
    
    //get all articles
    let articlesList = await articlescollection
      .find({ status: true })
      .toArray();
    
    // Enrich articles with author full names
    const enrichedArticles = await Promise.all(
      articlesList.map(async (article) => {
        const author = await authorscollection.findOne({ username: article.username });
        return {
          ...article,
          authorFullName: author ? author.fullName : article.username
        };
      })
    );
    
    //send res
    res.send({ message: "articles", payload: enrichedArticles });
  })
);

//post comments for an arcicle by atricle id
userApp.post(
  "/comment/:articleId", verifyToken,
  expressAsyncHandler(async (req, res) => {
    //get user comment obj
    const userComment = req.body;
    const articleIdFromUrl = (+req.params.articleId);
    //insert userComment object to comments array of article by id
    let result = await articlescollection.updateOne(
      { articleId: articleIdFromUrl },
      { $addToSet: { comments: userComment } }
    );
    console.log(result);
    res.send({ message: "Comment posted" });
  })
);

// Like/unlike an article
userApp.post(
  "/like/:articleId", verifyToken,
  expressAsyncHandler(async (req, res) => {
    const articleIdFromUrl = (+req.params.articleId);
    const username = req.username; // from verifyToken middleware
    
    console.log(`Like toggle request for article ${articleIdFromUrl} by user ${username}`);
    
    // Find the article
    const article = await articlescollection.findOne({ articleId: articleIdFromUrl });
    if (!article) {
      return res.status(404).send({ message: "Article not found" });
    }
    
    // Initialize likedUsers array if it doesn't exist
    const likedUsers = article.likedUsers || [];
    
    // Check if user already liked the article
    const hasLiked = likedUsers.includes(username);
    console.log(`User ${username} has liked: ${hasLiked}`);
    
    if (hasLiked) {
      // Unlike: remove user from likedUsers array and decrease likes count
      const result = await articlescollection.updateOne(
        { articleId: articleIdFromUrl },
        { 
          $pull: { likedUsers: username },
          $inc: { likes: -1 }
        }
      );
      
      // Get updated article to return accurate count
      const updatedArticle = await articlescollection.findOne({ articleId: articleIdFromUrl });
      const newLikesCount = Math.max(0, updatedArticle.likes || 0);
      
      console.log(`Article unliked. New count: ${newLikesCount}`);
      res.send({ message: "Article unliked", liked: false, likesCount: newLikesCount });
    } else {
      // Like: add user to likedUsers array and increase likes count
      const result = await articlescollection.updateOne(
        { articleId: articleIdFromUrl },
        { 
          $addToSet: { likedUsers: username },
          $inc: { likes: 1 }
        }
      );
      
      // Get updated article to return accurate count
      const updatedArticle = await articlescollection.findOne({ articleId: articleIdFromUrl });
      const newLikesCount = updatedArticle.likes || 0;
      
      console.log(`Article liked. New count: ${newLikesCount}`);
      res.send({ message: "Article liked", liked: true, likesCount: newLikesCount });
    }
  })
);

// Increment view count when article is read (only once per user per article)
userApp.post(
  "/view/:articleId", verifyToken,
  expressAsyncHandler(async (req, res) => {
    const articleIdFromUrl = (+req.params.articleId);
    const username = req.username; // from verifyToken middleware
    
    // Find the article
    const article = await articlescollection.findOne({ articleId: articleIdFromUrl });
    if (!article) {
      return res.status(404).send({ message: "Article not found" });
    }
    
    // Initialize viewedUsers array if it doesn't exist
    const viewedUsers = article.viewedUsers || [];
    
    // Check if user already viewed the article
    const hasViewed = viewedUsers.includes(username);
    
    if (!hasViewed) {
      // Only increment if user hasn't viewed before
      await articlescollection.updateOne(
        { articleId: articleIdFromUrl },
        { 
          $addToSet: { viewedUsers: username },
          $inc: { views: 1 }
        }
      );
      res.send({ message: "View counted" });
    } else {
      res.send({ message: "Already viewed" });
    }
  })
);

//export userApp
// Get user full name by username
userApp.get(
  "/user-details/:username",
  expressAsyncHandler(async (req, res) => {
    const username = req.params.username;
    
    try {
      // Check in users collection first
      let user = await userscollection.findOne({ username: username });
      if (user) {
        return res.send({
          fullName: `${user.firstName} ${user.lastName}`,
          userType: 'user'
        });
      }
      
      // Check in authors collection
      user = await authorscollection.findOne({ username: username });
      if (user) {
        return res.send({
          fullName: `${user.firstName} ${user.lastName}`,
          userType: 'author'
        });
      }
      
      // If not found, return the username as is
      res.send({
        fullName: username.split('@')[0], // Remove @domain.com if it's an email
        userType: 'unknown'
      });
    } catch (error) {
      console.error('Error fetching user details:', error);
      res.send({
        fullName: username.split('@')[0],
        userType: 'unknown'
      });
    }
  })
);

module.exports = userApp;
