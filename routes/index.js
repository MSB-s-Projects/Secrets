// import dotenv and configure it
require("dotenv").config();
// import express
const express = require("express");
// import mongoose
const mongoose = require("mongoose");
// import expess-session
const session = require("express-session");
// import passport
const passport = require("passport");
// import passport-local-mongoose
const passportLocalMongoose = require("passport-local-mongoose");
// import passport-google-oauth20 strategy
const GoogleStrategy = require("passport-google-oauth20").Strategy;
// import mongoose.findOrCreate
const findOrCreate = require("mongoose-findorcreate");

// create express router
const router = express.Router();

// set up express-session
router.use(
  session({
    secret: process.env.encryption_secret,
    resave: false,
    saveUninitialized: false,
  })
);

// initialize passport and passport session
router.use(passport.initialize());
router.use(passport.session());

//Set up default mongoose connection
mongoose.set("strictQuery", true);
const mongoDB = process.env.mongoURL;
mongoose.connect(mongoDB, { useNewUrlParser: true });
//Get the default connection
const db = mongoose.connection;
//Bind connection to error event (to get notification of connection errors)
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// Create model for saving users in database.
const Schema = mongoose.Schema;

// Create a schema for users
const usersSchema = new Schema({
  email: String,
  password: String,
  googleId: String,
});

// Use passport-local-mongoose to hash and salt password
usersSchema.plugin(passportLocalMongoose);
// Use mongoose-findOrCreate to find or create user
usersSchema.plugin(findOrCreate);

// Compile model from schema
var User = mongoose.model("User", usersSchema);

// use static authenticate method of model in LocalStrategy
passport.use(User.createStrategy());

// use serializing and deserializing the user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

// use passport-google-oauth20 strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: process.env.callbackURL,
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    function (accessToken, refreshToken, profile, cb) {
      User.findOrCreate({ googleId: profile.id }, function (err, user) {
        console.log(profile);
        return cb(err, user);
      });
    }
  )
);

// "/" router
router
  .route("/")

  .get(function (req, res, next) {
    res.render("home");
  });

// "/auth/google" route for google authentication with passport
router
  .route("/auth/google")
  .get(passport.authenticate("google", { scope: ["profile"] }));

// "/auth/google/secrets" route for google authentication with passport
router
  .route("/auth/google/secrets")

  .get(
    passport.authenticate("google", { failureRedirect: "/login" }),
    (req, res) => {
      res.redirect("/secrets");
    }
  );

// "login" route
router
  .route("/login")

  .get((req, res) => {
    res.render("login");
  })

  .post((req, res) => {
    const user = new User({
      username: req.body.password,
      password: req.body.password,
    });

    req.login(user, (err) => {
      if (err) {
        console.log(err);
        res.redirect("/login");
      } else {
        passport.authenticate("local")(req, res, () => {
          res.redirect("/secrets");
        });
      }
    });
  });

// "/register" route
router
  .route("/register")

  .get((req, res) => {
    res.render("register");
  })

  .post((req, res) => {
    User.register(
      { username: req.body.username },
      req.body.password,
      (err, user) => {
        if (err) {
          console.log(err);
          res.redirect("/register");
        } else {
          passport.authenticate("local")(req, res, () => {
            res.redirect("/secrets");
          });
        }
      }
    );
  });


// "/secrets" route
router
  .route("/secrets")

  .get((req, res) => {
    if (req.isAuthenticated()) {
      res.render("secrets");
    } else {
      res.redirect("login");
    }
  });


// "/logout" route
router
  .route("/logout")

  .get((req, res) => {
    req.logout((err) => {
      if (err) {
        console.log(err);
        res.redirect("/secrets");
      } else {
        res.redirect("/");
      }
    });
  });

// export router
module.exports = router;
