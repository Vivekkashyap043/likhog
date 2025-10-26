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

## Troubleshooting

Short, actionable fixes for common problems.

- Port already in use (EADDRINUSE)

  1. Find the process using the port:

     ```powershell
     netstat -ano | findstr :4000
     ```

  2. Kill the process (replace <PID> with the number from netstat):

     ```powershell
     taskkill /PID <PID> /F
     ```

  3. Or start the server on a temporary port:

     ```powershell
     $env:PORT=5000; node server.js
     ```

- SMTP / email problems

  - Look at the server console for `transporter.verify()` output. Common messages and fixes:
    - Authentication errors (EAUTH/535): wrong username/password — for Gmail use an App Password.
    - ENOTFOUND: wrong SMTP host.
    - TLS/ECONNECTION: wrong port/secure setting — try port 587 with secure=false or port 465 with secure=true.
  - For local development use Mailtrap or Ethereal to avoid real delivery issues.

- Messages accepted by SMTP but not received

  - Provider may classify messages as spam or drop them. For production use SendGrid/Mailgun/Postmark and set SPF/DKIM records.

If you paste the server logs here I will parse them and give exact fixes.

## FAQ (quick answers)

Q: I click "Create Account" and the spinner never stops. What do I do?

- A: Two quick checks:
  1) Is the backend running and reachable? Confirm `node server.js` is running and the port matches `REACT_APP_API_BASE_URL` in `client/.env`.
  2) Did the server log an error? Check server console — if email sending previously blocked the request you should now see the registration succeeded (server responds immediately) and the email is sent asynchronously.

Q: I never receive verification emails. How can I debug?

- A: Inspect server logs for transporter verification and send errors. Typical steps:
  1) Ensure SMTP env vars are correct (or use Mailtrap/Ethereal).
  2) Check server startup logs for `transporter.verify()` output.
  3) On successful send you should see `messageId` or an Ethereal preview URL in logs.

Q: How can I change the API URL during development?

- A: Create `client/.env` with `REACT_APP_API_BASE_URL=http://localhost:5000` (or the port your server uses) and restart the client.

Q: Can I make registration fail if email cannot be sent?

- A: Currently registration responds immediately and emails are sent in background to avoid UI hangs. If you need synchronous behavior I can add an env toggle (e.g., `WAIT_FOR_EMAIL=true`) to make the server wait for sendMail before responding.

## Database schema (collections)

Below are the main MongoDB collections and their commonly used fields. Fields marked (required) are added/expected by the server code; others are commonly used by the frontend.

### `users` (collection name in code: `userscollection`)

| Field | Type | Notes |
|---|---:|---|
| `_id` | ObjectId | MongoDB id |
| `username` | string | Unique username (auto-generated from email) |
| `fullName` | string | User's display name (required at registration) |
| `email` | string | Unique email (required) |
| `password` | string | Hashed password (bcrypt) |
| `isEmailVerified` | boolean | false until user verifies |
| `emailVerifiedAt` | Date  null | Timestamp when verification happened |
| `createdAt` | Date | Account creation time |

### `authors` (collection name in code: `authorscollection`)

| Field | Type | Notes |
|---|---:|---|
| `_id` | ObjectId | MongoDB id |
| `username` | string | Unique username (auto-generated from email) |
| `fullName` | string | Author's display name |
| `email` | string | Unique email |
| `password` | string | Hashed password (bcrypt) |
| `isEmailVerified` | boolean | false until verified |
| `emailVerifiedAt` | Date  null | Timestamp when verification happened |
| `createdAt` | Date | Account creation time |

### `articles` (collection name in code: `articlescollection`)

| Field | Type | Notes |
|---|---:|---|
| `_id` | ObjectId | MongoDB id |
| `articleId` | number | App-level numeric id (client sets Date.now()) |
| `title` | string | Article title |
| `content` | string | Article body/html/text |
| `username` | string | Author username (foreign key) |
| `authorFullName` | string | Denormalized author name for quick render |
| `category` | string | Article category/tag |
| `dateOfCreation` | Date | Creation timestamp (client sets) |
| `dateOfModification` | Date | Last modification timestamp (client sets) |
| `status` | boolean | true = published, false = soft-deleted/draft |
| `views` | number | View count |
| `viewsedUsers` | array | (typo in code: actually `viewedUsers`) usernames who viewed |
| `likes` | number | Likes count |
| `likedUsers` | array | usernames who liked the article (for toggle behavior) |
| `comments` | array | Embedded comment objects (see below) |

### Comment object (embedded inside `articles.comments`)

| Field | Type | Notes |
|---|---:|---|
| `username` | string | Commenter's username |
| `fullName` | string | Commenter's display name |
| `text` | string | The comment body |
| `createdAt` | Date | When comment was posted |

Notes:

- The application embeds comments inside articles for simplicity. Likes/views are stored as counts plus `likedUsers`/`viewedUsers` arrays so the server can toggle/limit actions per user.
- If you prefer normalized schemas (separate `comments` collection) we can migrate to that later; current approach optimizes for simple reads of article + comments.
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


 Author: Vivek Kashyap — contact: vivekkashyap043@gmail.com
