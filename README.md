# LikhoG - Blog Application

A full-stack blog application built with React.js frontend and Node.js backend, featuring user authentication, article management, and email verification.

🌐 **Live Demo**: [https://likhog.onrender.com](https://likhog.onrender.com)

## 🌟 Features

- **User Authentication**: Secure registration and login with JWT tokens
- **Email Verification**: Account verification via email before login
- **Article Management**: Create, read, update, and delete articles
- **User Roles**: Separate interfaces for users and authors
- **Comment System**: Users can comment on articles
- **Like System**: Users can like/unlike articles
- **View Tracking**: Track article views per user
- **Responsive Design**: Mobile-first design with full responsive layout
- **Password Reset**: Forgot password functionality with email recovery
- **Real-time Updates**: Dynamic content updates without page refresh

## 🏗️ Project Structure

```
likhog/
├── client/                 # React.js frontend
│   ├── public/
│   │   ├── _redirects      # Hosting service SPA routing config
│   │   ├── .htaccess       # Apache server config (backup)
│   │   └── index.html      # Main HTML file
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── reset-password/     # Password reset component
│   │   │   ├── email-verification/ # Email verification component
│   │   │   └── ...         # Other components
│   │   ├── redux/          # Redux store and slices
│   │   ├── config/         # API configuration
│   │   └── assets/         # Images and static files
│   ├── express-server.js   # Production Express server for SPA routing
│   ├── render.yaml         # Render deployment configuration
│   ├── netlify.toml        # Netlify deployment configuration
│   ├── vercel.json         # Vercel deployment configuration
│   └── package.json        # Frontend dependencies and scripts
├── server/                 # Node.js backend
│   ├── APIs/               # API route handlers
│   │   ├── user-api.js     # User authentication and data
│   │   ├── author-api.js   # Author-specific endpoints
│   │   └── common-api.js   # Email verification and password reset
│   ├── Middlewares/        # Custom middleware
│   ├── server.js           # Main server file
│   └── package.json        # Backend dependencies
└── README.md
```

## 🚀 Tech Stack

### Frontend
- **React.js** - UI library
- **React Router** - Navigation
- **Redux Toolkit** - State management
- **Bootstrap** - CSS framework
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **React Icons** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Nodemailer** - Email service
- **CORS** - Cross-origin requests

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas account)
- **Gmail account** (for email functionality)

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Vivekkashyap043/likhog.git
cd likhog
```

### 2. Backend Setup

#### Navigate to server directory
```bash
cd server
```

#### Install dependencies
```bash
npm install
```

#### Create environment file
Create a `.env` file in the server directory with the following variables:

```env
# Database Configuration
DB_URL=mongodb://localhost:27017/blogdb
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/blogdb

# JWT Secret Key (use a strong, random string)
SECRET_KEY=your_super_secret_jwt_key_here

# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000

# Server Port (optional, defaults to 4000)
PORT=4000
```

#### Gmail App Password Setup
1. Enable 2-factor authentication on your Gmail account
2. Go to Google Account settings > Security > App passwords
3. Generate an app password for "Mail"
4. Use this app password in the `EMAIL_PASSWORD` field

### 3. Frontend Setup

#### Navigate to client directory (from root)
```bash
cd client
```

#### Install dependencies
```bash
npm install
```

#### Update API Configuration (if needed)
The API base URL is configured in `src/config/api.js`. For local development, update if necessary:

```javascript
export const API_BASE_URL = 'http://localhost:4000';
```

## 🏃‍♂️ Running the Application

### Development Mode

#### Start the Backend Server
```bash
# From the server directory
cd server
npm run dev
# or
npm start
```
The server will run on `http://localhost:4000`

#### Start the Frontend Application
```bash
# From the client directory (new terminal)
cd client
npm start
```
The frontend will run on `http://localhost:3000`

### Production Mode

#### Build the Frontend
```bash
cd client
npm run build
```

#### Start the Production Server
```bash
cd server
npm start
```

## 🔧 Environment Variables

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_URL` | MongoDB connection string | `mongodb://localhost:27017/blogdb` |
| `SECRET_KEY` | JWT secret key | `your_secret_key_here` |
| `EMAIL_USER` | Gmail email address | `your-email@gmail.com` |
| `EMAIL_PASSWORD` | Gmail app password | `your_app_password` |

### Optional Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `FRONTEND_URL` | Frontend URL for emails | `http://localhost:3000` |
| `PORT` | Server port | `4000` |

## 📚 API Endpoints

### User Endpoints
- `POST /user-api/user` - User registration
- `POST /user-api/login` - User login
- `GET /user-api/articles` - Get all articles
- `POST /user-api/comment/:articleId` - Add comment
- `POST /user-api/like/:articleId` - Like/unlike article
- `POST /user-api/view/:articleId` - Track article view
- `GET /user-api/user-details/:username` - Get user details

### Author Endpoints
- `POST /author-api/author` - Author registration
- `POST /author-api/login` - Author login
- `POST /author-api/article` - Create article
- `PUT /author-api/article` - Update article
- `DELETE /author-api/article/:id` - Delete article
- `PUT /author-api/article/:id` - Restore article

### Common Endpoints
- `POST /common-api/send-verification` - Send verification email
- `POST /common-api/verify-email` - Verify email
- `POST /common-api/forgot-password` - Request password reset
- `POST /common-api/reset-password` - Reset password

## 🗄️ Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  fullName: String,
  email: String,
  username: String,
  password: String (hashed),
  isEmailVerified: Boolean,
  emailVerifiedAt: Date,
  createdAt: Date
}
```

### Authors Collection
```javascript
{
  _id: ObjectId,
  fullName: String,
  email: String,
  username: String,
  password: String (hashed),
  isEmailVerified: Boolean,
  emailVerifiedAt: Date,
  createdAt: Date
}
```

### Articles Collection
```javascript
{
  _id: ObjectId,
  articleId: Number,
  title: String,
  content: String,
  username: String,
  category: String,
  status: Boolean,
  likes: Number,
  views: Number,
  likedUsers: [String],
  viewedUsers: [String],
  comments: [
    {
      comment: String,
      username: String,
      dateOfComment: Date
    }
  ],
  dateOfCreation: Date,
  dateOfModification: Date
}
```

## 🚀 Deployment

### Frontend Deployment

This application includes an Express server configuration to handle SPA (Single Page Application) routing in production, ensuring that routes like `/reset-password` and `/verify-email` work correctly when accessed directly.



### Deployment

#### Manual Deployment (Recommended)

1. Build the client app:
  ```powershell
  cd client
  npm install
  npm run build
  ```

2. Ensure the build output (`client/build`) is available and will be served by the server.

3. Start the server:
  ```powershell
  cd ../server
  npm install
  node server.js
  ```

4. The server should be configured to serve static files from the `client/build` directory. (Check `express-server.js` or `server.js` for static file serving logic.)

5. Deploy the server (with the client build included) to your chosen platform (e.g., Render, Heroku, AWS, etc.).

6. Make sure environment variables are set as required (see `.env.example`).

---

**Note:** Remove any references to `render.yaml`, `netlify.toml`, or `vercel.json` as these are not required for manual deployment. If using a platform-specific configuration, refer to that platform's documentation.


#### Build and Deploy Commands

```bash
# Build the React application
cd client
npm install
npm run build

# Test the Express server locally (optional)
npm run serve

# The build folder will be served by express-server.js in production
```

### Backend Deployment (Render/Heroku)

1. **Set environment variables** in your hosting platform:
```env
DB_URL=your_mongodb_connection_string
SECRET_KEY=your_jwt_secret_key
EMAIL_USER=your_gmail_address
EMAIL_PASSWORD=your_gmail_app_password
FRONTEND_URL=https://your-frontend-url.onrender.com
PORT=4000
```

2. **Configure deployment settings**:
```yaml
Build Command: npm install
Start Command: npm start
Root Directory: server
Environment: Node
```

3. **Deploy the server directory**

### Production URLs
- Frontend: `https://likhog.onrender.com`
- Backend: `https://likhog-server.onrender.com`

### Post-Deployment Verification

After deployment, test these critical routes:
- ✅ `https://your-app.onrender.com/` - Home page
- ✅ `https://your-app.onrender.com/reset-password?token=...` - Password reset
- ✅ `https://your-app.onrender.com/verify-email?token=...` - Email verification
- ✅ `https://your-app.onrender.com/login` - Login page
- ✅ All other React Router routes

## 🧪 Testing

### Run Frontend Tests
```bash
cd client
npm test
```

### Run Backend Tests
```bash
cd server
npm test
```

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check if MongoDB is running locally
   - Verify DB_URL in environment variables
   - Ensure network access for MongoDB Atlas

2. **Email Not Sending**
   - Verify Gmail app password is correct
   - Check if 2FA is enabled on Gmail
   - Ensure EMAIL_USER and EMAIL_PASSWORD are set

3. **CORS Errors**
   - Verify API base URL in frontend configuration
   - Check server CORS settings

4. **JWT Token Issues**
   - Ensure SECRET_KEY is set in environment
   - Check token expiration settings

5. **SPA Routing Issues (404 Not Found on Direct URL Access)**
   - **Problem**: Routes like `/reset-password` or `/verify-email` show "Not Found" when accessed directly
   - **Cause**: Production server doesn't handle client-side routing
   - **Solution**: Use the Express server approach (recommended):
     ```bash
     # Ensure express-server.js is in client directory
     # Update Render service to Web Service (not Static Site)
     # Build Command: npm install && npm run build
     # Start Command: node express-server.js
     ```
   - **Alternative**: Configure hosting service redirects:
     - **Render**: Add rewrite rule `/* → /index.html (200)`
     - **Netlify**: Use `_redirects` file
     - **Vercel**: Use `vercel.json` configuration

6. **Email Links Not Working**
   - Check that FRONTEND_URL environment variable is set correctly
   - Verify email templates are generating correct URLs
   - Ensure SPA routing is properly configured (see issue #5)
   - Test email links after deployment completion

7. **Build/Deployment Failures**
   - Check build logs in hosting platform
   - Verify all dependencies are listed in package.json
   - Ensure build command includes all necessary steps
   - Check for environment-specific issues (Node.js version, npm/yarn differences)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License. See the LICENSE file for details.

## 👨‍💻 Author

**Vivek Kashyap**
- GitHub: [@Vivekkashyap043](https://github.com/Vivekkashyap043)
- Email: vivekkashyap043@gmail.com

## 📞 Support

For support, email vivekkashyap043@gmail.com or create an issue in the GitHub repository.

## 🎯 Future Enhancements

- [ ] Image upload for articles
- [ ] Rich text editor for article creation
- [ ] Social media integration
- [ ] Advanced search functionality
- [ ] User profile customization
- [ ] Article categories and tags
- [ ] Email notifications for new articles
- [ ] Admin dashboard
- [ ] Analytics and reporting

---

⭐ **If you found this project helpful, please give it a star!** ⭐
