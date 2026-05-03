# Smart-Stay (ExplorePlace)

A full-stack Node.js web app for listing and booking stays (ExplorePlace). This README explains the exact runtime flow, middleware and request lifecycle, where key files live, and the technologies used.

**Project Flow (exact)**
- `app.js` (entry point)
  - Loads environment variables (`dotenv`) and config.
  - Connects to MongoDB using `mongoose` (URL from `process.env.ATLASDB_URL` or local fallback).
  - Configures sessions with `connect-mongo` and `express-session` (session store uses `process.env.SECRET`).
  - Configures `passport` (local strategy via `passport-local` / `passport-local-mongoose`) for authentication.
  - Registers global middleware:
    - `express.urlencoded` / `express.json` for body parsing
    - `method-override` for HTTP verbs
    - `express.static` to serve `/public`
    - flash middleware and a `res.locals` middleware that sets `success`, `error`, and `currentUser` for views
  - Mounts routes:
    - `app.use('/listing', routes/listing.js)` — listing index, create, show, edit, update, delete
    - `app.use('/listing/:id/reviews', routes/review.js)` — create/delete reviews
    - `app.use('/', routes/user.js)` — signup, login, logout
  - Redirects root (`/`) to `/listing` (landing page)
  - Adds a final error handler to render `views/listing/error.ejs` on errors

- `routes/listing.js` and `controllers/listings.js`
  - `GET /listing` — list all listings (pagination/filters in UI)
  - `GET /listing/new` — form to create a listing (protected by `isLoggedIn` middleware)
  - `POST /listing` — upload image (multer + cloud config) then `createListing` to save new `Listing` document
  - `GET /listing/:id` — show single listing (includes `chat` partial if logged in)
  - `GET /listing/:id/edit` & `PUT /listing/:id` — edit/update listing (owner-only)
  - `DELETE /listing/:id` — remove listing and cascade-delete related reviews via `listingSchema.post('findOneAndDelete')`

- `routes/user.js` and `controllers/users.js`
  - User signup (`/signup`) — register new `User` (passport-local-mongoose handles hashing)
  - Login (`/login`) — `passport.authenticate('local')`; middleware saves redirect URL when needed (`saveRedirectUrl`) and after login redirects to saved URL or `/listing`
  - Logout (`/logout`) — `req.logout()` and redirect

- `middleware.js`
  - `isLoggedIn` — checks `req.isAuthenticated()`; if not, sets `req.session.redirectUrl = req.originalUrl`, flashes error, and redirects to `/login`
  - `saveRedirectUrl` — moves value into `res.locals.redirectUrl` for use after login
  - Validation middleware uses Joi schemas (`schema.js`) and throws `ExpressError` on validation failures

- Models
  - `models/listing.js` — mongoose schema: `title`, `description`, `image` (string url), `price`, `location`, `country`, `reviews` (ObjectId refs), `owner` (User ref) and middleware to delete reviews on listing delete
  - `models/review.js` — review schema and author reference
  - `models/user.js` — passport-local-mongoose plugin for authentication

- Image uploads
  - `multer` + `cloudConfig.js` (Cloudinary or similar) handle file upload and store URL in `listing.image` (string). The app expects `listing.image` to be a string URL.

- Chat
  - Optional real-time chat uses `socket.io` (server created with `http.createServer(app)` and `socket.io(server)`). Each listing has a chat room keyed by listing ID; messages broadcast to `io.to(listingId)`.
  - Chat UI partial is `views/listing/chat.ejs` (included in `show.ejs`) — create this file if you see `Could not find include './chat'` error.

**Used Technologies**
- Runtime & Frameworks: Node.js, Express
- Database: MongoDB with Mongoose
- Authentication: Passport.js with `passport-local` and `passport-local-mongoose`
- Sessions: `express-session` + `connect-mongo`
- Templates: EJS with `ejs-mate` layout helpers
- File uploads: `multer` (local) + Cloudinary (via `cloudConfig.js`) or other remote storage
- Real-time: `socket.io` (optional chat)
- Frontend UI: Bootstrap 5, Font Awesome
- Maps: Mapbox (mapbox token in `.env`)
- Environment: `dotenv` for local env variables

**Project Structure (key files)**
- `app.js` — main entry and server config
- `routes/` — `listing.js`, `review.js`, `user.js`
- `controllers/` — `listings.js`, `reviews.js`, `users.js`
- `models/` — `listing.js`, `review.js`, `user.js`
- `views/` — EJS views and includes (`includes/navbar.ejs`, `includes/flash.ejs`, `layout/boilerplate.ejs`, `listing/show.ejs`)
- `public/` — static assets (`css`, `js`)
- `init/data.js` and `init/init-db.js` — seed data and initializer script

**Environment variables (required)**
- `ATLASDB_URL` — MongoDB connection string (or leave unset to use local `mongodb://127.0.0.1:27017/ExplorePlace`)
- `SECRET` — session secret for `express-session` and `connect-mongo`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_KEY`, `CLOUDINARY_SECRET` — for image uploads (if using Cloudinary)
- `MAPBOX_TOKEN` — Mapbox API token (if map features used)

**Setup & Run**
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env` (or set env vars) with values listed above.
3. (Optional) Seed DB with sample data:
   ```bash
   node init/init-db.js
   ```
4. Start app:
   ```bash
   node app.js
   # or with nodemon
   npx nodemon app.js
   ```
5. Visit `http://localhost:3000` — the app redirects root to `/listing`.

---
_README generated to reflect current project structure and runtime flow._
