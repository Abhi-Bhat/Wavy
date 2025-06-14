const express = require("express");
const app = express();
const userModel = require("./models/user");
const postsModel = require("./models/posts");
const jwt = require("jsonwebtoken");
const { name } = require("ejs");
const user = require("./models/user");
const cookieParser = require("cookie-parser");
const posts = require("./models/posts");
const multer  = require('multer')
const path = require('path');

app.set("view engine", "ejs");
// app.use(express.json);
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); 
app.use(express.static('public'))



const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads')
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix+ext)
  }
})

const upload = multer({ storage: storage })


app.get("/", (req, res) => {
  res.render("login");
});


app.get("/register", (req, res) => {
  res.render("index");
});

app.get("/profile",isLoggedIn,async (req, res) => {
  let user = await userModel.findOne({email: req.user.email}).populate("posts");
  res.render("profile",{user});
});

app.get("/like/:id",isLoggedIn,async (req, res) => {
  let post  = await postsModel.findOne({_id: req.params.id}).populate("user");
  post.likes.push(req.user.userid);
  await post.save()
  res.redirect("/profile");
});

app.get("/delete/:id",isLoggedIn,async (req, res) => {
  let post = await postsModel.deleteOne({_id: req.params.id});
  res.redirect("/profile");
});

app.post("/post",upload.single('image'),isLoggedIn,async (req, res) => {
  let user = await userModel.findOne({email: req.user.email});
  let post = await postsModel.create({
    user: user._id,
    name: user.name,
    content: req.body.content,
    image: req.file ? `/uploads/${req.file.filename}` : null
  });
 

  user.posts.push(post._id);
  await user.save();
  res.redirect("/profile"); 
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/logout", (req, res) => {
  res.cookie("token", "");
  res.render("login");
});

app.post("/login", async (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  let user = await userModel.findOne({ email });
  if (user && user.password === password) {
    let token = jwt.sign({ email: user.email, userid: user._id }, "shhh");
    res.cookie("token", token); 
    res.redirect("/profile");
  } else {
    res.send("Invalid credentials");
  }
});

app.post("/register", async (req, res) => {
  let username = req.body.userName;
  let name = req.body.name;
  let email = req.body.email;
  let password = req.body.password;
  let age = req.body.age;

  let user = await userModel.create({
    username,
    name,
    email,
    password,
    age,
  });
  let token = jwt.sign({ email: req.body.email, userid: user._id }, "shhh");

  res.cookie("token", token);
  res.redirect("/profile");
});

function isLoggedIn(req, res, next) {
  const token = req.cookies?.token; 

    const data = jwt.verify(token, "shhh"); 
    req.user = data;
    next(); 
}

app.listen(3000);