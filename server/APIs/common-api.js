//create common api app
const exp = require('express');
const commonApp = exp.Router();
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const expressAsyncHandler = require('express-async-handler');
require('dotenv').config();

let usercollection;
let authorscollection;

// Get collections from app
commonApp.use((req, res, next) => {
    usercollection = req.app.get("userscollection");
    authorscollection = req.app.get("authorscollection");
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

// Verify email configuration on startup
transporter.verify((error, success) => {
    if (error) {
        console.log('Email configuration error:', error);
    } else {
        console.log('Email service is ready to send messages');
    }
});

// Health check endpoint
commonApp.get('/health', (req, res) => {
    res.send({ message: "Server is running", status: "OK", timestamp: new Date() });
});

// Get server info
commonApp.get('/info', (req, res) => {
    res.send({ 
        message: "LikhoG API", 
        version: "1.0.0",
        endpoints: {
            user: "/user-api",
            author: "/author-api", 
            admin: "/admin-api"
        }
    });
});

// Get real-time statistics
commonApp.get('/stats', expressAsyncHandler(async (req, res) => {
    try {
        const articlesCollection = req.app.get("articlescollection");
        
        // Get counts from database
        const [userCount, authorCount, articleCount] = await Promise.all([
            usercollection.countDocuments(),
            authorscollection.countDocuments(),
            articlesCollection.countDocuments({ status: true }) // Only published articles
        ]);
        
        res.send({
            readers: userCount,
            writers: authorCount,
            articles: articleCount,
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).send({ message: "Failed to fetch statistics" });
    }
}));

// Send verification email
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
                        Thank you for requesting email verification for your LikhoG ${userType} account. 
                        To verify your email address, please click the button below.
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
                        If you didn't request this verification, you can safely ignore this email.
                    </p>
                </div>
            </div>
        `
    };
    
    return await transporter.sendMail(mailOptions);
};

// Send password reset email
const sendPasswordResetEmail = async (email, fullName, userType, resetToken) => {
    const resetUrl = `https://likhog.onrender.com/reset-password?token=${resetToken}`;
    
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'LikhoG - Password Reset Request',
        html: `
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; border-radius: 10px; text-align: center; color: white;">
                    <h1 style="margin: 0; font-size: 28px;">Password Reset</h1>
                    <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Reset your LikhoG password</p>
                </div>
                
                <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #333; margin-top: 0;">Hello ${fullName}!</h2>
                    <p style="color: #666; line-height: 1.6;">
                        We received a request to reset the password for your LikhoG ${userType} account. 
                        If you made this request, click the button below to reset your password.
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold; font-size: 16px;">
                            Reset Password
                        </a>
                    </div>
                    
                    <p style="color: #999; font-size: 14px; line-height: 1.5;">
                        If the button doesn't work, copy and paste this link into your browser:<br>
                        <a href="${resetUrl}" style="color: #f5576c; word-break: break-all;">${resetUrl}</a>
                    </p>
                    
                    <p style="color: #999; font-size: 14px;">
                        This password reset link will expire in 1 hour for security reasons.
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                    
                    <p style="color: #999; font-size: 12px; text-align: center;">
                        If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
                    </p>
                </div>
            </div>
        `
    };
    
    return await transporter.sendMail(mailOptions);
};

// Email verification endpoint
commonApp.post('/send-verification', expressAsyncHandler(async (req, res) => {
    const { email, username, userType } = req.body;
    
    if (!email || !username || !userType) {
        return res.status(400).send({ message: "Email, username, and user type are required" });
    }
    
    // Get user's full name from database
    const collection = userType === 'author' ? authorscollection : usercollection;
    const user = await collection.findOne({ email: email });
    
    if (!user) {
        return res.status(404).send({ message: "User not found" });
    }
    
    // Generate verification token
    const verificationToken = jwt.sign(
        { 
            email: email, 
            username: username,
            userType: userType 
        },
        process.env.SECRET_KEY,
        { expiresIn: '24h' }
    );
    
    try {
        await sendVerificationEmail(email, user.fullName, userType, verificationToken);
        res.send({ message: "Verification email sent successfully" });
    } catch (error) {
        console.error('Error sending verification email:', error);
        res.status(500).send({ message: "Failed to send verification email" });
    }
}));

// Verify email endpoint
commonApp.post('/verify-email', expressAsyncHandler(async (req, res) => {
    const { token } = req.body;
    
    if (!token) {
        return res.status(400).send({ message: "Verification token is required" });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const { email, userType } = decoded;
        
        // Update user verification status
        const collection = userType === 'author' ? authorscollection : usercollection;
        const result = await collection.updateOne(
            { email: email },
            { $set: { isEmailVerified: true, emailVerifiedAt: new Date() } }
        );
        
        if (result.modifiedCount === 0) {
            return res.status(404).send({ message: "User not found" });
        }
        
        res.send({ message: "Email verified successfully" });
        
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(400).send({ message: "Verification token has expired" });
        }
        return res.status(400).send({ message: "Invalid verification token" });
    }
}));

// Forgot Password endpoint
commonApp.post('/forgot-password', expressAsyncHandler(async (req, res) => {
    const { email, userType } = req.body;
    
    // Validate input
    if (!email || !userType) {
        return res.status(400).send({ message: "Email and user type are required" });
    }
    
    // Check which collection to search
    const collection = userType === 'author' ? authorscollection : usercollection;
    const user = await collection.findOne({ email: email });
    
    if (!user) {
        return res.status(404).send({ message: "No account found with this email address" });
    }
    
    // Generate reset token
    const resetToken = jwt.sign(
        { 
            email: user.email, 
            username: user.username,
            userType: userType 
        },
        process.env.SECRET_KEY,
        { expiresIn: '1h' }
    );
    
    try {
        await sendPasswordResetEmail(user.email, user.fullName, userType, resetToken);
        res.send({ message: "Password reset email sent successfully" });
    } catch (error) {
        console.error('Error sending password reset email:', error);
        res.status(500).send({ message: "Failed to send password reset email" });
    }
}));

// Reset Password endpoint
commonApp.post('/reset-password', expressAsyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
        return res.status(400).send({ message: "Token and new password are required" });
    }
    
    try {
        // Verify the reset token
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const { email, userType } = decoded;
        
        // Hash the new password
        const bcryptjs = require('bcryptjs');
        const hashedPassword = await bcryptjs.hash(newPassword, 6);
        
        // Update password in the appropriate collection
        const collection = userType === 'author' ? authorscollection : usercollection;
        const result = await collection.updateOne(
            { email: email },
            { $set: { password: hashedPassword } }
        );
        
        if (result.modifiedCount === 0) {
            return res.status(404).send({ message: "User not found" });
        }
        
        res.send({ message: "Password reset successfully" });
        
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(400).send({ message: "Reset token has expired" });
        }
        return res.status(400).send({ message: "Invalid reset token" });
    }
}));

//export commonApp
module.exports = commonApp;