// Load environment variables first
if(process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
console.log(process.env.SECRET); // Check if this exists

const express = require('express');
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const ListingRouter = require("./routes/listing.js");
const ReviewRouter = require("./routes/review.js");
const UserRouter = require("./routes/user.js");

const MongoStore = require('connect-mongo'); 
const session = require("express-session");
const ExpressError = require("./utils/ExpressError");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

// Basic middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session configuration
const store = MongoStore.create({
    mongoUrl: process.env.NODE_ENV !== 'production'
        ? (process.env.LOCAL_DB_URL || "mongodb://127.0.0.1:27017/ExplorePlace")
        : (process.env.ATLASDB_URL || process.env.LOCAL_DB_URL || "mongodb://127.0.0.1:27017/ExplorePlace"),
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: process.env.SECRET,
    }
});

store.on("error", function(e) {
    console.log("SESSION STORE ERROR", e);
});

const sessionOptions = {
    store: store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
    }
};

app.use(session(sessionOptions));
app.use(flash());

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Local variables
app.use((req, res, next) => {
    res.locals.success = req.flash("success") || [];
    res.locals.error = req.flash("error") || [];
    res.locals.currentUser = req.user || null;
    next();
});
// MongoDB connection setup
// const { MongoClient } = require("mongodb");
// const uri = process.env.ATLASDB_URL;
// const client = new MongoClient(uri, {
//   tls: true,
//   tlsAllowInvalidCertificates: false, 
// });


// Database connection
// In development prefer the local DB to avoid Atlas DNS/SSL issues when ATLAS URL is set incorrectly
const DBurl = process.env.NODE_ENV !== 'production'
    ? (process.env.LOCAL_DB_URL || "mongodb://127.0.0.1:27017/ExplorePlace")
    : (process.env.ATLASDB_URL || process.env.LOCAL_DB_URL || "mongodb://127.0.0.1:27017/ExplorePlace");

const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4, // Use IPv4, skip trying IPv6
    retryWrites: true,
    w: 'majority',
    tls: process.env.NODE_ENV === 'production',
    tlsAllowInvalidCertificates: process.env.NODE_ENV === 'production' ? false : true,
};

async function main() {
    try {
        await mongoose.connect(DBurl, mongooseOptions);
        console.log("Connected to MongoDB Atlas");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
}

main();

// Add this in app.js to test connection
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected');
});

// Routes
app.use("/listing", ListingRouter);
app.use("/listing/:id/reviews", ReviewRouter);
app.use("/", UserRouter);

// Redirect root to /listing (ensure landing page is /listing)
app.get('/', (req, res) => {
  res.redirect(301, '/listing');
});
// ...existing code...
// Redirect root to /listing (ensure landing page is /listing)
app.get('/', (req, res) => {
  res.redirect(301, '/listing');
});
// ...existing code...
// Error handling
app.use((err, req, res, next) => {
    console.error("Error:", err);
    let { status = 500, message = 'Something went wrong' } = err;
    res.status(status).render("listing/error", { err });
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});