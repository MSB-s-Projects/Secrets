var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");

//Set up default mongoose connection
mongoose.set("strictQuery", true);
var mongoDB = "mongodb://127.0.0.1/secretsDB";
mongoose.connect(mongoDB, { useNewUrlParser: true });
//Get the default connection
var db = mongoose.connection;
//Bind connection to error event (to get notification of connection errors)
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// Create model for saving users in database.
var Schema = mongoose.Schema;

var usersSchema = new Schema({
  email: String,
  password: String,
});

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
          if (foundUser.password === req.body.password) {
            res.render("secrets");
          } else {
            res.redirect("/login");
          }
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
    newUser = new User({
      email: req.body.username,
      password: req.body.password,
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

module.exports = router;
