# LikhoG — Full-stack Blogging Platform

Welcome to LikhoG. This README explains the architecture, important flows (registration → verification → login), technologies used, and step-by-step setup instructions for both frontend and backend. All commands below are PowerShell-ready.

## Contents

- Project overview
- Flow summary
- Tech stack
- Repo layout
- Environment variables
- Quick start (frontend & backend)
- Email testing
- Troubleshooting
Author: Vivek Kashyap — contact: vivekkashyap043@gmail.com
 2. Client sends request to backend; backend returns 201 quickly.
 3. Client navigates to `/verify-email-sent` giving instructions to check email.
 4. User clicks verification link in email (or copy/pastes into browser). Frontend verifies token and then shows success/error.

 ---

 ## Environment variables (what you must set)

 Create a `.env` file in `server/` with at least these variables:

 Required (backend):
 - DB_URL — MongoDB connection string (e.g., `mongodb://localhost:27017/blogdb` or Atlas URI)
 - SECRET_KEY — strong JWT secret
 - EMAIL_USER — SMTP username (email address)
 - EMAIL_PASS or EMAIL_PASSWORD — SMTP password (for Gmail use App Password)
 - FRONTEND_URL — where the frontend runs (e.g., `http://localhost:3000`)

 Optional/alternate SMTP env names supported by the server code:
 - EMAIL_HOST or SMTP_HOST — SMTP server host (e.g., `smtp.gmail.com`)
 - EMAIL_PORT or SMTP_PORT — SMTP port (e.g., 587)
 - EMAIL_SECURE — 'true' or 'false' (use true for port 465)

 Client-side (optional):
 - Create `client/.env` with `REACT_APP_API_BASE_URL=http://localhost:5000` if your server runs on 5000.

 Security note: never commit `.env` with credentials to source control. Use the `.env.example` as a template.

 ---

 ## Step-by-step setup (development)

 Prerequisites
 - Node.js (v16+ recommended)
 - npm or yarn
 - MongoDB (local or Atlas)

 Backend (server)
 1. Open a terminal and go to the server folder:
 ```powershell
 cd D:\projects\blogging\likhog\server
 npm install
 ```
 2. Create `.env` using `server/.env.example` as reference. Example (local):
 ```text
 DB_URL=mongodb://localhost:27017/blogdb
 SECRET_KEY=replace_with_a_random_secret
 FRONTEND_URL=http://localhost:3000
 EMAIL_HOST=smtp.gmail.com
 EMAIL_PORT=587
 EMAIL_USER=you@gmail.com
 EMAIL_PASS=your_app_password_here
 PORT=5000
 ```
 3. Start the server:
 ```powershell
 node server.js
 # or (with nodemon)
 npx nodemon server.js
 ```

 Frontend (client)
 1. In a new terminal:
 ```powershell
 cd D:\projects\blogging\likhog\client
 npm install
 ```
 2. (Optional) Create `client/.env` with the API base URL for local development:
 ```text
 REACT_APP_API_BASE_URL=http://localhost:5000
 ```
 3. Start the client:
 ```powershell
 npm start
 ```
 4. Open `http://localhost:3000` in your browser.

 ---

 ## Running and testing

 - Registration: create a new account; after submission you should be redirected to `/verify-email-sent` and see the email hint.
 - Verification: click the email link to verify (or copy the verification URL printed in server logs for testing).
 - Login: you cannot login until your account is verified. The server returns a 403 with a helpful message if not verified.

 Automated tests: there are no comprehensive tests included by default. You can run `npm test` in `client/` if you added tests.

 ---

 ## Debugging email delivery — what to look for in the server console

 I added robust logging into the email code so you can see exactly what is happening. When you start the server, check these lines:

 - Server startup summary (sanitized env): shows whether DB_URL and EMAIL_USER are set.
 - Transporter verification log: if SMTP config is invalid you'll see `Email configuration error:` with details.
 - When sending verification emails you will see logs like:
   - `Attempting to send verification email to <email>`
   - `Verification link: <url>`
   - On success: `Verification email sent: { messageId, accepted, rejected, response }`
   - On error: `Error in sendVerificationEmail: <error message>` or the async send will log `Error sending verification email (async): <error message>`

 Common problems and fixes
 - Authentication/EAUTH/535 errors: usually wrong username/password. For Gmail, create an App Password and use it. Ensure 2FA is enabled then create App Password.
 - ENOTFOUND: the SMTP host name is wrong.
 - ECONNECTION/TLS errors: check `EMAIL_PORT` and `EMAIL_SECURE`. Port 587 with secure=false (STARTTLS) is common; port 465 requires secure=true.

 If you paste the exact server error logs here I will parse them and give exact instructions.

 ---

 ## Deployment notes

 - Build the React app with `npm run build` in `client/`.
 - Copy the `client/build` folder alongside `server/` and ensure `server.js` serves static files from `../client/build` (already configured).
 - On the hosting platform (Render, Heroku, AWS), configure the server service root to `server/` and set environment variables in the platform dashboard.

 Recommended production SMTP providers (if you need reliable email delivery): SendGrid, Mailgun, Postmark, Amazon SES. They usually provide better deliverability than plain Gmail.

 ---

 ## API summary (quick reference)

 - `POST /user-api/user` — Register a user (body: fullName, email, password, userType)
 - `POST /user-api/login` — Login (body: email, password)
 - `POST /author-api/author` — Register an author
 - `POST /common-api/send-verification` — Send verification email (body: email, username, userType)
 - `POST /common-api/verify-email` — Verify email (body: token)

 For full list check the `server/APIs` folder.

 ---

 ## Database schema (short)

 Users and Authors collections contain:
 - fullName, email, username, password (hashed), isEmailVerified, emailVerifiedAt, createdAt

 Articles collection stores: title, content, username (author), likes, views, comments array, status, timestamps.

 ---

 ## Troubleshooting & FAQ

 Q: I click "Create Account" and the spinner never stops.
 A: Two likely causes:
   1. Your backend didn't respond (port conflict or server not running) — check server console and ensure server is running and reachable from client.
   2. SMTP sending was blocking earlier; we changed registration to respond immediately and send email asynchronously. If you still see hangs, check server logs printed to console.

 Q: I never receive verification emails.
 A: Check server logs for transporter.verify errors or send errors. Confirm EMAIL_USER and EMAIL_PASS are correct (App Password for Gmail). Consider using a transactional email provider.

 Q: How do I change API URL while developing?
 A: Create `client/.env` with `REACT_APP_API_BASE_URL=http://localhost:5000` and restart the client.

 ---

 ## Next steps / improvements (ideas for future work)

 - Add unit/integration tests for backend routes and email flows.
 - Replace Nodemailer with a provider SDK (e.g., SendGrid) for improved deliverability and logging.
 - Add file/image uploads and a rich-text editor for articles.
 - Add rate-limiting and stronger security layers for production.

 ---

 If anything in this README is unclear or you want me to add screenshots or step-by-step walkthroughs (e.g., how to create a Gmail App Password), tell me which part and I'll expand it. Happy to add a short "quick start" script or docker-compose file if you want a one-command dev environment.

 ---

 Author: Vivek Kashyap — contact: vivekkashyap043@gmail.com
