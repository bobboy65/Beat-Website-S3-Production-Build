//Pieces script for setting up an express server
//start with npm init -y
//npm install express cors dotenv multer path --save
//npm install nodemon --save-dev
//can also setup backend and frontend starting at same time
//add "dev": "nodemon server.js" to scripts in package.json
//add npm i --save aws-sdk, could do mongoose or other 
const express = require('express');
const app = express();
const dotenv = require('dotenv').config();
const cors = require('cors');
const multer = require('multer')
const multerS3 = require('multer-s3');
const fs = require("fs");
const util = require('util')

const AWS = require('aws-sdk')
const path = require("path");
const bodyParser = require('body-parser');
const getDownloads = require("./routes/upload")
const userControl = require("./routes/user")

//will generate a UUIDv4 key for each entry
const {randomUUID} = require('crypto')
const favorite_number = 18;

app.use(cors());
app.use(express.json());
//app.use(bodyParser.json());
app.use(express.urlencoded({limit: "30mb",extended:true}));
//app.use("/upload", express.static(path.join(__dirname,"./uploads")))

const ID = process.env.AWS_ACCESS_KEY_ID
const SECRET = process.env.AWS_SECRET_ACCESS_KEY; 
const LOCATION = process.env.AWS_LOCATION;
const BUCKET_NAME_3 = process.env.BUCKET_NAME_3;
const BUCKET_NAME_4 = process.env.BUCKET_NAME_4;

var s3 = new AWS.S3({
    accessKeyId: ID,
    secretAccessKey: SECRET,
    Bucket: BUCKET_NAME_3
})

//Access S3 with personal keys

//IMPORTANT NOTE :
//Objects/Files in Amazon S3 are immutable and cannot be appended to or changed. 
//In order to simulate append, you would need to write the entire file again with the 
//additional data.
AWS.config.update({
    region: LOCATION,
    accessKeyId: ID,
    secretAccessKey: SECRET
})
//Setup for the new bucket
//Create bucket, used first as a test that we are connected, make bucket
// s3.createBucket(params, function(err, data) {
//     if (err) console.log(err, err.stack);
//     else console.log('Bucket Created Successfully', data.Location);
// });

///////////////////////////////////////////////////////////////////////////////////////
//roped off section handlesuploads, getDownload, upload file is for downloads
var upload = multer({    
    storage: multerS3({
        s3: s3,
        bucket: BUCKET_NAME_3,
        metadata: function (req, file, cb){
            cb(null, {fieldName: file.fieldname});
        },
        key: function(req, file, cb) {
            cb(null, randomUUID())
        },
    })
})

app.post('/upload', upload.array('fileUpload', 2), async (req, res) => {    
var body = JSON.parse(JSON.stringify(req.body))
//console.log(req.body);
//console.log(req.files);
//console.log(keyGen)
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


app.get("/" , (req, res) => {
    res.send("App is working")
});

app.use("/download" , getDownloads)
app.use("/user" , userControl)


const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Backend started on port ${PORT}`);
});

