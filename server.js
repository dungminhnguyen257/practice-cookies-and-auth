const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const languages = require("./languages.json");
const req = require("express/lib/request");

const app = express();
const port = 8080;
const users = {};

app.use(cookieParser());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false })); // why false

app.set("view engine", "ejs");

const generateRandomString = () => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const getUserByID = (id) => {
  for (const userId in users) {
    if (userId === id) {
      return users[userId];
    }
  }
  return null;
};

app.get("/", (req, res) => {
  res.send("Hello");
});

app.get("/home", (req, res) => {
  const userLanguage = req.cookies.language || "en"; //set the default cookie to en if userL is undefined
  const templateVars = {
    heading: languages.homeHeadings[userLanguage],
    body: languages.homeBodies[userLanguage],
  };
  res.render("home", templateVars);
});

app.get("/about", (req, res) => {
  const userLanguage = req.cookies.language || "en";
  const templateVars = {
    heading: languages.aboutHeadings[userLanguage],
    body: languages.aboutBodies[userLanguage],
  };
  res.render("about", templateVars);
});

app.get("/language/:userLanguage", (req, res) => {
  //need explaination
  res.cookie("language", req.params.userLanguage);
  res.redirect("/home");
});

app.get("/login", (req, res) => {
  if (req.cookies.userId) {
    res.redirect("/protected");
  }
  res.render("login");
});

app.get("/register", (req, res) => {
  if (req.cookies.userId) {
    res.redirect("/protected");
  }
  res.render("register");
});

app.get("/protected", (req, res) => {
  //passing something to this
  const user = getUserByID(req.cookies.userId);
  if (user) {
    const templateVars = {
      user: user,
    };
    res.render("protected", templateVars);
  }
  res.redirect("/login");
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  let foundUser;
  for (const userId in users) {
    if (users[userId].email === email) {
      foundUser = users[userId];
    }
  }
  if (foundUser) {
    return res.status(400).send("A user with that email already exists!");
  }

  const id = generateRandomString();
  const newUser = {
    id,
    email,
    password,
  };
  users[id] = newUser;
  console.log(users);
  res.redirect("/login");
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  let foundUser;
  for (const userId in users) {
    if (users[userId].email === email) {
      foundUser = users[userId];
    }
  }
  if (!foundUser) {
    return res.status(400).send("User does not exists!");
  }

  if (foundUser.password != password) {
    return res.status(400).send("Incorrect password");
  }
  res.cookie("userId", foundUser.id);
  res.redirect("/home");
});

app.post("/logout", (req, res) => {
  res.clearCookie("userId");
  res.clearCookie("language");
  res.redirect("/home");
});

app.listen(port, () => {
  console.log(`server is listening on ${port}`);
});
