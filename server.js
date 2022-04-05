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
const getUploads = require("./routes/upload")

//will generate a UUIDv4 key for each entry
const {randomUUID} = require('crypto')




app.use(cors());
app.use(express.json());
//app.use(bodyParser.json());
app.use(express.urlencoded({limit: "30mb",extended:true}));
//app.use("/upload", express.static(path.join(__dirname,"./uploads")))

const ID = process.env.AWS_ACCESS_KEY_ID
const SECRET = process.env.AWS_SECRET_ACCESS_KEY; 
const LOCATION = process.env.AWS_LOCATION;
const BUCKET_NAME = "nextdaybeats/uploads";

var s3 = new AWS.S3({
    accessKeyId: ID,
    secretAccessKey: SECRET,
    Bucket: BUCKET_NAME
})

//Access S3 with personal keys
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

const UUIDv4Generator = () => {
    let generate = randomUUID(); 
    return generate;
}

let keyGen = UUIDv4Generator();
var upload = multer({
    
    storage: multerS3({
        s3: s3,
        bucket: BUCKET_NAME,
        metadata: function (req, file, cb){
            cb(null, {fieldName: file.fieldname});
        },
        key: function(req, file, cb) {
            cb(null, randomUUID())
        },
    })
})

// const fileName = 'userUploads.csv';
// const uploadFile = () => {
//     fs.open(fileName)
//     fs.readFile(fileName, (err, data) => {
//        if (err) throw err;
//        const params = {
//            Bucket: 'nextdaybeats', // pass your bucket name
//            Key: 'userUploads.csv', // file will be saved as testBucket/contacts.csv
//            Body: JSON.stringify(data)
//        };
//        s3.upload(params, function(s3Err, data) {
//            if (s3Err) throw s3Err
//            console.log(`File uploaded successfully at ${data.Location}`)
//        });
//     });
//   };

app.post('/upload', upload.array('fileUpload', 2), async (req, res) => {    
var body = JSON.parse(JSON.stringify(req.body))
//console.log(req.body);
//console.log(req.files);
console.log(keyGen)
const params = {
    Bucket: "nextdaybeats/uploadInformation",
    
    Key: req.body.artist, 
    Body: JSON.stringify(req.body),
}
s3.upload(params, function(err) {
    console.log(JSON.stringify(err) + " " + JSON.stringify(req.body));
});
    console.log('check S3 for what should be a successful upload')
})


app.get("/" , (req, res) => {
    res.send("App is working")
});

app.use("/download" , getUploads)


const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Backend started on port ${PORT}`);
});

