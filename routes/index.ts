const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
require("dotenv").config();

router.use(
  session({
    secret: process.env.encryption_secret,
    resave: false,
    saveUninitialized: false,
  })
);

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

const usersSchema = new Schema({
  email: String,
  password: String,
});

usersSchema.plugin(passportLocalMongoose);

// Compile model from schema
var User = mongoose.model("User", usersSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// "/" router
router
  .route("/")

  .get(function (req, res, next) {
    res.render("home");
  });

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

router
  .route("/secrets")

  .get((req, res) => {
    if (req.isAuthenticated()) {
      res.render("secrets");
    } else {
      res.redirect("login");
    }
  });

router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.log(err);
      res.redirect("/secrets");
    } else {
      res.redirect("/");
    }
  });
});

module.exports = router;
