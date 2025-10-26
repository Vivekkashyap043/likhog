LikhoG — Detailed Project Documentation
======================================

This document is a deep-dive into the LikhoG project. It's written so you can use it in interviews — explain design decisions, describe data flows, and walk engineers (and non-engineers) through how the app works. It covers frontend and backend responsibilities, the key files and components, how features are implemented, the verification/email flow, security, common edge-cases, and debugging tips.

Table of contents
- High-level overview (one-liner for an interviewer)
- Architecture and data flow (request lifecycle)
- Backend — file-by-file and endpoint explanations
- Middleware and security
- Frontend — file-by-file and UI flow explanations
- State management and auth flow
- Email verification (detailed sequence)
- Database and data models
- Running the project locally (dev steps & env vars)
- Debugging checklist (logs to inspect, common fixes)
- Interview talking points (how to explain your choices)
- Next steps and improvements (what you'd add next)

---

High-level overview (one-liner)
--------------------------------
LikhoG is a full-stack blogging platform: readers can discover and read articles, authors can create and manage articles, and the system enforces user identity with email verification and JWT-based authentication.

For an interviewer: "I built a React frontend backed by a Node/Express API and MongoDB. I implemented secure registration, JWT auth, email verification, article CRUD, comments, likes, and view-tracking. The server sends verification emails and verification is required before login."

---

Architecture and request lifecycle
----------------------------------
1. Client (React) issues an HTTP request (axios) to the Express server.
2. Express route handler validates/handles the request, possibly using middleware (e.g., `verifyToken`) for protected routes.
3. The server reads/writes data from MongoDB (collections: userscollection, authorscollection, articlescollection).
4. For outgoing emails, the server uses Nodemailer to call an SMTP provider. Email sending is logged; in registration it's performed asynchronously so the client isn't blocked.
5. For authenticated flows, server issues a signed JWT (on login) that the client stores and sends back as a Bearer token for protected requests.

---

Backend — file-by-file and endpoint explanations
------------------------------------------------
Root: `server/`

- `server.js` — application entry point
  - Connects to MongoDB using `process.env.DB_URL` and stores collections on the Express app (`app.set('userscollection', userscollection)`).
  - Serves static files from the client build folder in production.
  - Mounts routers: `/user-api`, `/author-api`, `/common-api`, `/admin-api`.
  - Prints small startup diagnostics (sanitized env) to help debug missing env vars.

- `APIs/user-api.js` — user-facing endpoints (readers)
  - POST `/user` — register user. Validates required fields, unique email, auto-generates a username from email, hashes password using `bcryptjs`, sets `isEmailVerified=false`, inserts user into `userscollection`, responds immediately with 201, and then asynchronously sends a verification email (JWT token valid 24h) using the shared mail-sending routine.
  - POST `/login` — authenticate a user. Validates credentials, checks `isEmailVerified` (403 if false), issues JWT token (username) and returns user and token on success.
  - GET `/articles` — protected route (uses `verifyToken`) returns published articles with enriched author fullName.
  - POST `/comment/:articleId` — protected — adds the comment object to the article's comments array.
  - POST `/like/:articleId` — protected — toggles like/unlike by username; uses likedUsers array and increments/decrements likes count, returns updated likes.
  - POST `/view/:articleId` — protected — increments views only once per user by tracking a viewedUsers array.
  - GET `/user-details/:username` — returns a fullName and userType by searching users and authors collections.

- `APIs/author-api.js` — author endpoints
  - POST `/author` — author signup (similar to user signup, but in `authorscollection`).
  - POST `/login` — author login, issues JWT token, stores token on client.
  - Endpoints for author article CRUD: create, update, delete, restore, and get articles by author.

- `APIs/common-api.js` — shared flows (email & password reset)
  - POST `/send-verification` — sends a verification email for a given email/username/userType (good for resend flows).
  - POST `/verify-email` — accepts token and verifies it (jwt.verify), sets `isEmailVerified=true` and `emailVerifiedAt`.
  - POST `/forgot-password` — generates reset JWT and sends reset email.
  - POST `/reset-password` — accepts token and newPassword, verifies token, hashes and updates password.
  - Includes a transporter verify on startup and detailed logs for send attempts to make SMTP issues diagnosable.

- `APIs/admin-api.js` — admin features (if present in your project, review file for exact routes). Typically admin CRUD or management endpoints.

- `Middlewares/verifyToken.js` — protects routes requiring auth
  - Looks at `req.headers.authorization` for the bearer token.
  - Verifies JWT using `process.env.SECRET_KEY`.
  - On success sets `req.username = decoded.username` and calls `next()`.
  - On failure returns 401 unauthorized.

Important backend behaviours to highlight in interviews:
- Registration responds immediately (201) and sends verification email in background to keep UI snappy.
- Email verification uses JWT tokens (contains email & username & userType) signed with the server's secret to avoid storing temporary tokens in DB.
- Like/view toggles are idempotent (use `$addToSet` and manage counts), preventing duplicates.

---

Middleware & security details
-----------------------------
- Passwords: hashed with `bcryptjs` (salt rounds set to 6 in this project). Discuss trade-offs: more rounds => slower hashing but better security; recommended to use >=10 in production.
- Tokens: JWT signed with `SECRET_KEY`. On login a token with username is returned. The `verifyToken` middleware extracts the username from the token and attaches it to `req`.
- Protected endpoints: add `verifyToken` to routes that modify data or require account identity (comments, likes, views, article create/edit).
- CORS: `server.js` enables CORS so the frontend can call the backend in dev.
- Error handling: Express async handlers are wrapped with `express-async-handler`. There's a final error handler in `server.js` that sends error payloads.

Security talking points (for interviews):
- Explain why JWT is used (stateless, scalability). Discuss how refresh tokens or short-lived access tokens could be added.
- Explain password hashing choices and that you never store raw passwords.
- Recommend HTTPS in production and storing secrets in environment (or secret manager), not version control.

---

Frontend — file-by-file and UI flow explanations
------------------------------------------------
Root: `client/src/`

- `index.js` — app bootstrap; sets up Redux Provider and React Router.
- `App.js` — defines application routes via React Router. Key routes:
  - `/register` -> `Signup` component
  - `/signin` or `/login` -> `Signin` component
  - `/verify-email` -> `EmailVerification` component (handles the token in query string)
  - `/verify-email-sent` -> `EmailSent` (confirmation page after registration)
  - `/user-profile`, `/author-profile` -> nested routes for articles and author pages

Components (high-level):
- `signup/Signup.js` — registration form with validation (React Hook Form). Important details:
  - Validates fullName, email pattern, strong password rules, and confirmPassword.
  - Uses radio to select userType (user / author).
  - Submits to `API_ENDPOINTS.USER.REGISTER` or `API_ENDPOINTS.AUTHOR.REGISTER`.
  - On success redirects to `/verify-email-sent` and passes the email in state.

- `signin/Signin.js` — login form. Calls the Redux thunk `userAuthorLoginThunk` which performs the POST to login endpoint and on success stores token, user and userType in localStorage.

- `email-verification/EmailVerification.js` — reads the `token` query param, sends POST to `/common-api/verify-email` and shows success/error. On success it redirects user to `/signin` after a timeout.

- `email-verification/EmailSent.js` — simple information page instructing user to check their email.

- `articles/Articles.js` — list view; fetches from `/user-api/articles` (protected), maps and renders article cards.

- `article/Article.js` — article detail view with comments, likes, and view tracking. On open, it calls `/user-api/view/:id` (protected) to increment views.

- `add-article/AddArticle.js` — lazy-loaded for performance; contains form to create an article (author-only area). Uses author API endpoints.

- `header/Header.js` and `footer/Footer.js` — site chrome. Header shows login/register or user menu depending on Redux session state.

Client helpers and patterns:
- `config/api.js` centralizes API base URL and endpoints. For dev you can set `REACT_APP_API_BASE_URL` to override the default remote address.
- `axiosWithToken.js` creates an axios instance that automatically attaches the Bearer token from `localStorage` and handles 401 by redirecting to `/signin`.
- Components use `react-hook-form` for validation and `react-icons` for UI icons.

UI & UX design decisions you can emphasize:
- Password strength feedback during signup (progress bar) improves security and UX.
- Async-friendly design: signup returns quickly (server sends emails asynchronously) and client navigates to a friendly verification page.

---

State management and authentication flow
----------------------------------------
- Redux slice: `client/src/redux/slices/userAuthorSlice.js`:
  - `userAuthorLoginThunk` — async thunk that calls the login endpoints (user or author), stores token and user in localStorage on success.
  - `restoreUserSession` — reads localStorage and repopulates Redux state on app load.
  - `resetState` — logout/clear state and remove localStorage items.

- LocalStorage usage: token, user, userType. Axios instance (`axiosWithToken`) reads token dynamically per request.

Auth flow (detailed):
1. User submits login form.
2. `userAuthorLoginThunk` posts to API; on success stores token and user in localStorage.
3. Subsequent API calls use `axiosWithToken` which adds `Authorization: Bearer <token>` header.
4. Server `verifyToken` middleware parses JWT, validates it, and sets `req.username` to identify the caller.
5. On 401 responses axios interceptors remove token and redirect to `/signin`.

---

Email verification — detailed sequence and debugging
----------------------------------------------------
Flow:
1. Client registers user via `POST /user-api/user`.
2. Server inserts new user with `isEmailVerified:false` and generates a signed verification JWT valid for 24h.
3. Server responds immediately (201) and sends verification email asynchronously; email includes URL: `${FRONTEND_URL}/verify-email?token=<token>`.
4. When the user clicks the link, `EmailVerification` component sends token to `POST /common-api/verify-email`.
5. Server verifies JWT and updates the user's `isEmailVerified` to true.

Why we do asynchronous sending on registration:
- External SMTP providers can be slow or temporarily fail. If we awaited sendMail and it failed or timed out, the registration API would block and the client would hang. Responding immediately keeps UX fast; errors in email delivery are logged and can be retried.

Debugging tips (what to look at in server logs):
- On startup: look for transporter.verify logs — errors here indicate SMTP misconfiguration.
- On registration: you should see logs for user insert result and then an async send email result that includes messageId, accepted, rejected, or an error.
- If you see EAUTH/Invalid login: credentials are wrong (Gmail requires App Password when 2FA is enabled). If ENOTFOUND: SMTP host wrong. If TLS errors: port/secure mismatch.

---

Database models and example documents
------------------------------------
Users collection (fields used):
```js
{
  _id: ObjectId,
  fullName: String,
  email: String,
  username: String, // auto-generated from email if not provided
  password: String, // hashed
  isEmailVerified: Boolean,
  emailVerifiedAt: Date | null,
  createdAt: Date
}
```

Authors collection: same fields as users, stored separately.

Articles collection (example):
```js
{
  _id: ObjectId,
  articleId: Number, // unique numeric id used by UI
  title: String,
  content: String, // stringified html or text
  username: String, // author's username
  category: String,
  status: Boolean, // published/unpublished
  likes: Number,
  views: Number,
  likedUsers: [String],
  viewedUsers: [String],
  comments: [ { comment, username, dateOfComment } ],
  dateOfCreation: Date,
  dateOfModification: Date
}
```

---

Running locally (detailed, PowerShell-ready)
-------------------------------------------
1) Backend
```powershell
cd D:\projects\blogging\likhog\server
npm install
# create a .env file (see server/.env.example)
node server.js
# or, for auto-reload during development:
npx nodemon server.js
```
Look for logs showing transporter verification and DB connection: `Database connection successful` and `Email service is ready to send messages`.

2) Client
```powershell
cd D:\projects\blogging\likhog\client
npm install
# optional: create client/.env with REACT_APP_API_BASE_URL=http://localhost:5000
npm start
```

3) Test a full flow:
- Register -> check server logs for verification link -> either click the link in your mailbox or copy the verification link from server logs and open it in the browser -> verify email -> login.

---

Debugging checklist (what to copy to the interviewer if asked for a demo)
----------------------------------------------------------------------
- Server stdout on startup (sanitized env variables, DB connection, transporter verify output).
- Console output after a registration attempt: user insert result and async email send logs (messageId or error message).
- If email not arriving, copy transporter.verify error or sendMail exception — this indicates wrong credentials, host, or network issues.

Common console outputs and what they mean:
- `Email configuration error: <err>` — credentials/host/port mismatch.
- `Verification email sent: { messageId, accepted, rejected, response }` — success.
- `Error sending verification email (async): <err.message>` — asynchronous send failed; logs include message.

---

Interview talking points & suggested phrasing
--------------------------------------------
When asked to explain the project quickly (30–60s):
"LikhoG is a MERN-style blog application. The frontend is a React SPA with client-side routing and a Redux slice for user session state. The backend is Node/Express, storing data in MongoDB. I implemented secure signup with email verification using JWT tokens and Nodemailer; the server sends verification links and won't allow login until the email is verified. Authors can create articles and readers can like/comment."

When asked about technical trade-offs:
- Why JWT? "Stateless and straightforward to validate on the backend for protected routes. However, for production I'd add short lived access tokens with refresh tokens to improve security."
- Email sending sync vs async? "I made sending asynchronous to avoid blocking registration on slow/external SMTP. This keeps the UI responsive and allows the system to retry or log email failures separately."
- Password hashing? "I used bcryptjs to hash passwords; in production we'd use at least 10 rounds and possibly a managed auth provider for simplified maintenance."

When asked about scaling or performance:
- Use an external message queue for emails (e.g., RabbitMQ, SQS) to handle retries, spikes.
- Use a CDN and static app hosting for the frontend; use a managed MongoDB cluster for scaling reads/writes.

---

Next steps and improvements (short-term & long-term)
--------------------------------------------------
- Replace Nodemailer SMTP with a transactional provider SDK (SendGrid/Mailgun) for better deliverability.
- Add unit/integration tests for critical endpoints and e2e tests for the signup + verify flow.
- Implement refresh tokens and token revocation for better security.
- Add image upload (S3) and a WYSIWYG editor for articles.
- Add admin and analytics dashboards.

---

If you want, I can also:
- Add a `docs/` folder with per-file diagrams and call graphs.
- Create a `demo-checklist.md` with exact server console snippets you can paste during an interview (one-click demo scripts).
- Add docker-compose for one-command start (MongoDB + server + client in dev mode).

End of document.
