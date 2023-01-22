const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 15;
require("dotenv").config();

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

const secret = process.env.encryption_secret;

// Compile model from schema
var User = mongoose.model("User", usersSchema);

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
    User.findOne({ email: req.body.username }, (err, foundUser) => {
      if (!err) {
        if (foundUser !== null) {
          bcrypt.compare(
            req.body.password,
            foundUser.password,
            function (err, result) {
              if (result === true) {
                res.render("secrets");
              } else {
                res.redirect("/login");
              }
            }
          );
        } else {
          res.redirect("/login");
        }
      } else {
        res.send(err);
        console.log(err);
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
    bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
      const newUser = new User({
        email: req.body.username,
        password: hash,
      });

      newUser.save((err) => {
        if (!err) {
          res.render("secrets");
        } else {
          console.log(err);
          res.send(err);
        }
      });
    });
  });

module.exports = router;
