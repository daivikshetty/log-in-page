require('dotenv').config();
const express=require('express');
const bodyParser=require('body-parser');
const ejs=require('ejs');
const mongoose=require('mongoose');
const encrypt=require('mongoose-encryption');

const app=express();

app.use(express.static("public"));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect("mongodb://localhost:27017/secretsDB",{useNewUrlParser:true});

const secretSchema=new mongoose.Schema({
      userName:String,
      password:String
});

secretSchema.plugin(encrypt,{secret:process.env.SECRET,excludeFromEncryption: ['userName']});
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
      const newUser=new User({
            userName:req.body.username,
            password:req.body.password
      });

      newUser.save(function(err){
            if(err){
                  console.log(err);
            }
            else{
                  res.render("secrets");          //render secrets page only through register page
            }
      });

      // User.findOne({email:newUser.userName},function(err,foundUser){            //check if account already exists
      //       // if(err){
      //       //       console.log(err);
      //       // }
      //       // else{
      //       //       if(foundUser){
      //       //             console.log("Account already exists!");
      //       //             res.redirect("/register");
      //       //       }
      //       //       else{
      //       //             newUser.save(function(err){
      //       //                   if(err){
      //       //                         console.log(err);
      //       //                   }
      //       //                   else{
      //       //                         res.render("secrets");          //render secrets page only through register page
      //       //                   }
      //       //             });
      //       //       }
      //       // }
      // });
})

app.post("/login",function(req,res){
      const userName=req.body.username;
      const password=req.body.password

      User.findOne({email:userName},function(err,foundUser){
            if(err){
                  console.log(err);
            }
            else{
                  if(foundUser){
                        if(foundUser.password==password){
                              res.render("secrets");
                              console.log("Log in successful!");
                        }
                        else{
                              console.log("Wrong password!!");
                              res.redirect("/login");
                        }
                  }
            }
      });
})

app.listen(3000,function(){
      console.log("Server running on port 3000...");
})