//register new users, login and provide session authentication

var express = require("express");
var router = express.Router();
const dotenv = require('dotenv').config();
const AWS = require('aws-sdk')
const fs = require("fs");
const path = require('path');
const {randomUUID} = require('crypto')
const bcrypt = require('bcryptjs');
const { error } = require("console");

//MongoDB Initializations
const mongoose = require("mongoose");
const app = express();
const passport = require('passport');
const localStrategy = require('passport-local');
const passportLocalMongoose = require('passport-local-mongoose');
session = require('express-session');
User = require("../models/userModel");
ejs = require('ejs');
const bodyParser = require('body-parser');

const ID = process.env.AWS_ACCESS_KEY_ID
const SECRET = process.env.AWS_SECRET_ACCESS_KEY; 
const LOCATION = process.env.AWS_LOCATION;
const BUCKET_NAME_2 = process.env.BUCKET_NAME_2;
const URI = process.env.DB_URI;

var s3 = new AWS.S3();

    mongoose
  .connect(URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(
    console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));

  app.use(session({
    secret: "potatoPancakes" , //decode or encode session
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 2*60*1000
    }
}));
passport.serializeUser(User.serializeUser());       //session encoding
passport.deserializeUser(User.deserializeUser());   //session decoding
passport.use(new localStrategy(User.authenticate()));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded(
      { extended:true }
))
app.use(passport.initialize());
app.use(passport.session());

//current User
app.use(function (req, res,next){
    res.locals.currentUser = req.user;
    next();
})
//MIDDLEWARE
function isLoggedIn(req,res,next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

//REGISTER
router.post('/register' , async(req,res) => {
    const params = {
        Bucket: BUCKET_NAME_2,
        Key: req.body.artistName, 
        Body: JSON.stringify(req.body),
    }

    s3.upload(params, function(err) {
        console.log(JSON.stringify(err) + "" + JSON.stringify(req.body));
    });
    //Connect to MongoDB when register POST requested

    console.log(req.body)
    User.register(new User({
        artistName: req.body.artistName,
        email: req.body.emailHash,
        hashWord: req.body.passwordHash,
        songCount: 0
    }), function(err,user) {
        if(err) {
            console.log(err);
            res.render("register");
        }
    passport.authenticate("local")(req,res,function() {
        res.redirect("/login");
    })    
    })
});

//LOGIN 
router.post('/login' , async(req,res) => {
     const params = {
         Bucket: BUCKET_NAME_2,
         Key: 'johngotti',
     }
     //CONSOLE LOGS USED TO TEST DATA TRANSFERS
        const inbound = req.body;
        console.log(inbound)
        s3.getObject(params, (err, data) => {
            //LINE BELOW NEEDED SOME TINKERING TO PROPERLY DE-ENCODE
            let objectData = JSON.parse(data.Body.toString('utf-8'));
            console.log(objectData)
            console.log(objectData.passwordHash)
            let validationCheck = bcrypt.compareSync(inbound.email, objectData.emailHash) 
            && bcrypt.compareSync(inbound.password, objectData.passwordHash)
            if (err) console.error(err + "getLoginInfo error");
            else if(validationCheck){
               console.log('Logged in')
               res.send({ token: 'welcome ' + objectData.artistName}); 
            }
            else if(!validationCheck) {
                console.log("Email/password incorrect please try again")
                res.send({token: 'invalid'})
            }
        });
});


module.exports = router;