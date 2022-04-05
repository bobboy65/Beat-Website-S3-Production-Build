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

const {randomUUID} = require('crypto')


router.post('/' , async(req,res) => {
    const params = {
        Bucket: "nextdaybeats/users",
        Key: randomUUID(), 
        Body: JSON.stringify(req.body),
    }



});


module.exports = router;