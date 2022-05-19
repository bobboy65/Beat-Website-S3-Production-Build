//start with npm init -y
//npm install express cors dotenv multer path --save
//npm install nodemon --save-dev
//add "dev": "nodemon server.js" to scripts in package.json
const dotenv = require('dotenv').config();
const express = require('express');
const app = express();

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

const mongoose = require("mongoose");


//app.use(csurf());
app.use(cors({credentials: true, origin: 'http://localhost:3000'}));
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
const AUDIENCE = process.env.AUDIENCE
const CLIENTSECRET = process.env.CLIENTSECRET
const BASEURL = process.env.BASEURL

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
const { auth , requiresAuth } = require('express-openid-connect');
//const {auth , requiredScopes } = require('express-oauth2-jwt-bearer');
var jsonwebtoken = require('jsonwebtoken');
var jwks = require('jwks-rsa');
var {expressjwt: jwt} = require('express-jwt')
var unless = require('express-unless')
const request = require('request-promise-native');
const { Server } = require('http');



 const config = {
     authRequired: false,
     auth0Logout: true,
     secret: AUTHSECRET,
     baseURL: BASEURL,
     clientID: CLIENTID,
     issuerBaseURL: IBURL,
     clientSecret: CLIENTSECRET,
     authorizationParams: {
        response_type: 'code',
        audience: AUDIENCE,
        //scope: 'openid profile email',
      },
    // audience: AUDIENCE,
    // issuer: IBURL,
     //algorithms: ['RS256'],
    // jwksUri: 'https://dev-9l7-li-e.us.auth0.com/.well-known/jwks.json',
    // response_type: 'code',
    // scope: 'openid profile email read:user'
}

app.use(auth(config));

app.use(function (req, res, next) {
    res.locals.user = req.oidc.user;
    console.log(req.oidc.user)
    next();
  });

// req.isAuthenticated is provided from the auth router
 app.get('/signin', async (req, res, next) => {

    res.send(`hello ${JSON.stringify(req.oidc.user)}`)
    
 });

 app.get('/signup', (req, res) => {
    res.oidc.login({
      authorizationParams: {
        screen_hint: 'signup',
      },
    });
  });

//add authentication to a route:
app.get('/profile', requiresAuth(), (req,next, res) => {
     res.send( console.log(JSON.stringify(req.oidc.user)));
  });


 // app.get('/', (req, res) => {
    //res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out')
  //});

  app.get('/', async (req, res) => {
    let { token_type , access_token } = req.oidc.accessToken;

    const user = await request.get(AUDIENCE, {
      headers: {
        Authorization: `${token_type} ${access_token}`,
      },
    });
    res.send(`user: ${user}`);
  });


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

