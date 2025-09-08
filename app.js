if(process.env.NODE_ENV !== "production") {
    console.log(process.env.SECRET_KEY);
    require('dotenv').config();
}

const express = require('express');
const app = express();
const mongoose = require("mongoose");
const listing = require('./models/listing');
const path = require("path");
const bodyParser = require('body-parser');
const methodOverride = require("method-override")
const ejsMate = require("ejs-mate");

const ListingRouter = require("./routes/listing.js")
const ReviewRouter = require("./routes/review.js")
const UserRouter = require("./routes/user.js");

const MongoStore = require('connect-mongo'); 
const session = require("express-session");
const ExpressError = require("./utils/ExpressError");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");


app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"))
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate)
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, "public")))
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const store = MongoStore.create({
    mongoUrl: process.env.ATLASDB_URL,
    touchAfter: 24 * 60 * 60, // time period in seconds
    crypto: {
        secret: process.env.SECRET,
    }
});
store.on("error", function(e) {
    console.log("SESSION STORE ERROR", e)
});
const sessionOptions = {
   store: store,
  secret: process.env.SECRET ,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true, // Helps prevent XSS attacks
  }
};

app.use(session(sessionOptions));
app.use(flash())

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;
    // console.log(res.locals.success);
    next();
});

// MONGO_URL = "mongodb://localhost:27017/ExplorePlace"
const DBurl = process.env.ATLASDB_URL ;
main().then(() => {
    console.log("connected to mongodb")
})

async function main() {
    await mongoose.connect(DBurl);
}

// app.get("/", (req, res) => {
//     res.send("nbwkjefbwkefb")
// })

// app.get("/demouser", async (req, res) => {
//     const user = new User({ email: "test@example.com", username: "testuser" });
//     let newUser = await User.register(user, "password123");
//     res.send("Demo user created");
// });

app.use("/listing", ListingRouter);
app.use("/listing/:id/reviews", ReviewRouter);
app.use("/", UserRouter);

// app.all('*',(req,res,next) => {
//     next(new ExpressError(404,"page not found"));
// });
app.use((err, req, res, next) => {
    let { status = 500, message = 'Something went wrong' } = err;
    res.render("listing/error",{err})
})
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});