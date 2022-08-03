require('dotenv').config();
const express=require('express');
const bodyParser=require('body-parser');
const ejs=require('ejs');
const mongoose=require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const app=express();

app.use(express.static("public"));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
      secret:"A big dark secret!",
      resave:false,
      saveUninitialized:true
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/secretsDB",{useNewUrlParser:true});

const secretSchema=new mongoose.Schema({
      userName:String,
      password:String
});

secretSchema.plugin(passportLocalMongoose);

const User=new mongoose.model("User",secretSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/",function(req,res){
      res.render("home");
});

app.get("/login",function(req,res){
      res.render("login");
});

app.get("/register",function(req,res){
      res.render("register");
});

app.get("/secrets",function(req,res){
      if(req.isAuthenticated()){
            res.render("secrets");
      }
      else{
            res.redirect("/login");
      }
});

app.get("/logout",function(req,res){
      req.logout(function(err){
            if(err){
                  console.log(err);
            }
            else{
                  res.redirect("/");
            }
      });
});

app.post("/register",function(req,res){
      User.register({username:req.body.username, active: false}, req.body.password, function(err, user) {
            if (err) {
                  console.log(err);
            }
          
            const authenticate = User.authenticate();
            authenticate(req.body.username, req.body.password, function(err, result) {
              if (err) {
                  console.log(err);
              }
              else{
                 if(result){
                  console.log("Successfully registered!");
                  res.render("secrets");
                  // console.log(result);
              }
              else{
                  console.log("Couldn't Register!");
                  res.redirect("/register"); 
              }
              }
            });
          });
})

app.post("/login",function(req,res){
      const user=new User({
            userName:req.body.username,
            password:req.body.password
      });

      req.login(user,function(err){
            if(err){
                  console.log(err);
                  res.redirect("/login");
            }
            else{
                  const authenticate = User.authenticate();
                  authenticate(req.body.username, req.body.password, function(err, result) {
                  if (err) {
                        console.log(err);
                  }
                  else{
                  if(result){
                        console.log("Successfully logged in!");
                        res.redirect("/secrets");
                  }
                  else{
                        console.log("Couldn't Log in!");
                        res.redirect("/login"); 
                  }
                  }
                  });
            }
      })
})

app.listen(3000,function(){
      console.log("Server running on port 3000...");
})