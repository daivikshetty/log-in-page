require('dotenv').config();
const express=require('express');
const bodyParser=require('body-parser');
const ejs=require('ejs');
const mongoose=require('mongoose');
const bcrypt=require('bcrypt');
const saltRounds=10;

const app=express();

app.use(express.static("public"));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect("mongodb://localhost:27017/secretsDB",{useNewUrlParser:true});

const secretSchema=new mongoose.Schema({
      userName:String,
      password:String
});

const User=new mongoose.model("User",secretSchema);



app.get("/",function(req,res){
      res.render("home");
});

app.get("/login",function(req,res){
      res.render("login");
});

app.get("/register",function(req,res){
      res.render("register");
});

app.post("/register",function(req,res){
      bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
            if(!err){
                  const newUser=new User({
                        userName:req.body.username,
                        password:hash
                  });
                  console.log(req.body.password,hash);
                  User.findOne({userName:newUser.userName},function(err,foundUser){       //check if account already exists
                        if(err){
                              console.log(err);
                        }
                        else{
                              if(foundUser){
                                    console.log("Account already exists!");
                                    res.redirect("/register");
                              }
                              else{
                                    newUser.save(function(err){
                                          if(err){
                                                console.log(err);
                                          }
                                          else{
                                                res.render("secrets");          //render secrets page only through register page
                                          }
                                    });
                              }
                        }
                  });
            }
            else{
                  console.log(err);
            }
      });

      
})

app.post("/login",function(req,res){
      const userName=req.body.username;
      const password=req.body.password;

      User.findOne({userName:userName},function(err,foundUser){
            if(err){
                  console.log(err);
            }
            else{
                  if(foundUser){
                        bcrypt.compare(password, foundUser.password, function(err, result) {
                              if(!err){
                                    if(result){
                                          res.render("secrets");
                                          console.log("Login Successful");
                                    }
                                    else{
                                          console.log("Wrong password");
                                          res.redirect("/login");
                                    }
                              }
                              else{
                                    console.log(err);
                              }
                          });
                  }
            }
      });
})

app.listen(3000,function(){
      console.log("Server running on port 3000...");
})