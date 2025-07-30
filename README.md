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
blog-app/
├── client/                 # React.js frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── redux/          # Redux store and slices
│   │   ├── config/         # API configuration
│   │   └── assets/         # Images and static files
│   └── package.json
├── server/                 # Node.js backend
│   ├── APIs/               # API route handlers
│   ├── Middlewares/        # Custom middleware
│   ├── server.js           # Main server file
│   └── package.json
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

### Frontend Deployment (Netlify/Vercel)

1. Build the project:
```bash
cd client
npm run build
```

2. Deploy the `build` folder to your hosting service

3. Update API base URL in `src/config/api.js` to your production server URL

### Backend Deployment (Render/Heroku)

1. Set environment variables in your hosting platform
2. Ensure `package.json` has the correct start script
3. Deploy the server directory

### Production URLs
- Frontend: `https://likhog.onrender.com`
- Backend: `https://likhog-server.onrender.com`

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
