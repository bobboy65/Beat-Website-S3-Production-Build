//script for setting up an express server
//start with npm init -y
//npm install express cors dotenv multer path --save
//npm install nodemon --save-dev
//can also setup backend and frontend starting at same time
//add "dev": "nodemon server.js" to scripts in package.json
//add npm i --save aws-sdk, could do mongoose or other 
//TO recreate node_modules, all of dependencies here and in routes should do it
const express = require('express');
const app = express();

const dotenv = require('dotenv').config();
const cors = require('cors');
const multer = require('multer')
const multerS3 = require('multer-s3');
const fs = require("fs");
const util = require('util')

//these three protect against various types of security attacks
const helmet = require('helmet');
const hpp = require('hpp');
const csurf = require('csurf');
const limiter = require('express-rate-limit');

const AWS = require('aws-sdk')
const path = require("path");
const bodyParser = require('body-parser');
const getDownloads = require("./routes/upload")
const userControl = require("./routes/user")

const request = require('request-promise-native');

const mongoose = require("mongoose");


//app.use(csurf());
app.use(cors());
app.use(express.json());
//app.use(bodyParser.json());
app.use(express.urlencoded({limit: "30mb",extended:true}));
//app.use("/upload", express.static(path.join(__dirname,"./uploads")))
app.use(hpp());
app.use(helmet());
//app.use(csurf());
app.use(limiter());

const ID = process.env.AWS_ACCESS_KEY_ID
const SECRET = process.env.AWS_SECRET_ACCESS_KEY; 
const LOCATION = process.env.AWS_LOCATION;
const BUCKET_NAME_3 = process.env.BUCKET_NAME_3;
const BUCKET_NAME_4 = process.env.BUCKET_NAME_4;
const URI = process.env.DB_URI;
const AUTHSECRET = process.env.AUTHSECRET
const CLIENTID = process.env.CLIENTID
const IBURL = process.env.IBURL

var s3 = new AWS.S3({
    accessKeyId: ID,
    secretAccessKey: SECRET,
    Bucket: BUCKET_NAME_3
})

//Access S3 with personal keys
AWS.config.update({
    region: LOCATION,
    accessKeyId: ID,
    secretAccessKey: SECRET
})

///////////////////////////////////////////////////////////////////////////////////////
//AUTH0 Initializations//
const { auth, requiresAuth } = require('express-openid-connect');

const config = {
    authRequired: false,
    auth0Logout: true,
    secret: AUTHSECRET,
    baseURL: 'http://localhost:3000/',
    clientID: CLIENTID,
    issuerBaseURL: IBURL,
    // respone_type: 'code',
    // audience: 'http://localhost:3000/benis',
    // scope: 'openid profile email offline_access read:benis',
    // prompt: 'consent',
}
// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));

//screen_hint=signup parameter when directiong to /authorize
// Middleware to make the `user` object available for all views
app.use(function (req, res, next) {
    res.locals.user = req.oidc.user;
    next();
  });

  
// req.isAuthenticated is provided from the auth router
 app.get('/signin', (req, res) => {
    // async function test(){
    // let { token_type, access_token, isExpired, refresh } = req.oidc.accessToken;
    // if (isExpired()) {
    //   ({ access_token } = await refresh());
    // }
    // const products = await request.get(`http://localhost:3000/benis`, {
    //   headers: {
    //     Authorization: `${token_type} ${access_token}`,
    //   },
    //   json: true,
    // });
    // res.send(`users: ${users.map(({ name }) => name).join(', ')}`);
    res.oidc.login();
    // }
    // test();
 });

 app.get('/signup', (req, res) => {
    res.oidc.login({
      authorizationParams: {
        screen_hint: 'signup',
      },
    });
  });



//  app.get('/signup', (req, res) => { 
//     //var user = JSON.stringify(req.oidc.user.nickname);
//     res.send(req.oidc.isAuthenticated() ? res.redirect(`http://localhost:3000/${user}`) : console.log('Logged out')) ;

//  });


//add authentication to a route:
// app.get('/profile', requiresAuth(), (req, res) => {
//     res.send(JSON.stringify(req.oidc.user))
// })


//roped off section handlesuploads, getDownload, upload file is for downloads
var upload = multer({    
    storage: multerS3({
        s3: s3,
        bucket: BUCKET_NAME_3,
        metadata: function (req, file, cb){
            cb(null, {fieldName: file.fieldname});
        },
        key: function(req, file, cb) {
            //check line below ,uuid =>req.body.SongFile
            cb(null, req.body.songFile)
        },
    })
})
//ABOVE SECTION S3 Storage, in user.js MongodbStorage initialized, Mongo for text S3 for files


////////////////////////////////////////////////////////////////////////////////////////
app.post('/upload', upload.array('fileUpload', 2), async (req, res) => {    
var body = JSON.parse(JSON.stringify(req.body))
//console.log(req.body);
//console.log(req.files);
//console.log(keyGen)     THIS SECTION POPULATES UPLOAD INFORMATION
const params = {
    Bucket: BUCKET_NAME_4,
    Key: req.body.artist, 
    Body: JSON.stringify(req.body),
}
s3.upload(params, function(err) {
    console.log(JSON.stringify(err) + " " + JSON.stringify(req.body));
});
    console.log('check S3 for what should be a successful upload')
})
///////////////////////////////////////////////////////////////////////////////////////

app.use("/download" , getDownloads)
app.use("/user" , userControl)



const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Backend started on port ${PORT} , config base url: blank for now`);
});

