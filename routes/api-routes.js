// *********************************************************************************
// api-routes.js - this file offers a set of routes for displaying and saving data to the db
// *********************************************************************************

// Dependencies
// =============================================================

// Requiring our Todo model
var db = require("../models");
const { Op } = db.Sequelize;
var passport = require("../config/passport");

// helper functions
const authorRegexp = (author) => {
  let temp;
  let splitString = author.trim().split(/[\s\.]+/);
  console.log(splitString);
  temp = splitString.map((s) => {
    if (s.length <= 3) {
      // return `${s[0]}\.? *${s[1]}`;
      return s.split(/\B/).join("\\.? *");
    } else {
      return s;
    }
  });
  console.log(temp);
  return temp.join("\\.? *");
};

// Routes
// =============================================================
module.exports = function (app) {
  // GET route for getting all of the posts
  app.get("/api/books/title/search/:title", async (req, res) => {
    try {
      let nameLike = `%${req.params.title}%`;
      let results = await db.Book.findAll({
        where: {
          title: {
            [Op.like]: nameLike,
          },
          languageCode: {
            [Op.like]: "en%",
          },
        },
        order: [
          ["ratingsCount", "DESC"],
          ["averageRating", "DESC"],
        ],
      });
      res.json(results);
    } catch (err) {
      console.log(err);
    }
  });
  // Using the passport.authenticate middleware with our local strategy.
  // If the user has valid login credentials, send them to the members page.
  // Otherwise the user will be sent an error
  app.post("/api/login", passport.authenticate("local"), function (req, res) {
    res.json(req.user);
  });

  // Route for signing up a user. The user's password is automatically hashed and stored securely thanks to
  // how we configured our Sequelize User Model. If the user is created successfully, proceed to log the user in,
  // otherwise send back an error
  app.post("/api/signup", function (req, res) {
    db.User.create({
      email: req.body.email,
      password: req.body.password,
    })
      .then(function () {
        res.redirect(307, "/api/login");
      })
      .catch(function (err) {
        res.status(401).json(err);
      });
  });

  // Route for logging user out
  app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
  });

  // Route for getting some data about our user to be used client side
  app.get("/api/user_data", function (req, res) {
    if (!req.user) {
      // The user is not logged in, send back an empty object
      res.json({});
    } else {
      // Otherwise send back the user's email and id
      // Sending back a password, even a hashed password, isn't a good idea
      res.json({
        email: req.user.email,
        id: req.user.id,
      });
    }
  });

  app.get("/api/books/author/search/:author", async (req, res) => {
    try {
      let author = authorRegexp(req.params.author);
      let results = await db.Book.findAll({
        where: {
          authors: {
            [Op.regexp]: author,
          },
        },
        order: [
          ["ratingsCount", "DESC"],
          ["averageRating", "DESC"],
        ],
      });
      res.json(results);
    } catch (err) {
      console.log(err);
    }
  });
};
