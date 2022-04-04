var express = require("express");
var router = express.Router();
const dotenv = require('dotenv').config();
const AWS = require('aws-sdk')
const fs = require("fs");
const path = require('path');
const filePath = path.join('downloadedFile')

const ID = process.env.AWS_ACCESS_KEY_ID
const SECRET = process.env.AWS_SECRET_ACCESS_KEY; 
const LOCATION = process.env.AWS_LOCATION;
const BUCKET_NAME = "nextdaybeats";

var s3 = new AWS.S3();

var Params = {
    Bucket: BUCKET_NAME,
    Key: 'uploadInformation/ToniIG-88'
}


router.get('/' , async(req,res) => {
    s3.getObject(Params, (err, data) => {
        if (err) console.error(err + "getobject error");
        fs.writeFileSync(filePath, data.Body);
    
            res.download(filePath, function (err) {
            if (err) {
            console.log(res.headersSent)
          } else {
            //remove file
            fs.unlink(filePath, function (err) {
                if (err) {
                    console.error(err + "unlink error");
                }
                console.log('Temp File Deleted');
            });
          }
        })
        console.log(`${filePath} has been created!`);
      });
    });







module.exports = router;