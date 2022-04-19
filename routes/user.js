//register new users

var express = require("express");
var router = express.Router();
const dotenv = require('dotenv').config();
const AWS = require('aws-sdk')
const fs = require("fs");
const path = require('path');
const {randomUUID} = require('crypto')
const bcrypt = require('bcrypt');
const { error } = require("console");

const ID = process.env.AWS_ACCESS_KEY_ID
const SECRET = process.env.AWS_SECRET_ACCESS_KEY; 
const LOCATION = process.env.AWS_LOCATION;
const BUCKET_NAME_2 = process.env.BUCKET_NAME_2;


var s3 = new AWS.S3();


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



});

//LOGIN 
router.post('/login' , async(req,res) => {
     const params = {
         Bucket: BUCKET_NAME_2,
         Key: 'johngotti',
     }
     //CONSOLE LOGS USED TO TEST DATA TRANSFERS
        const inbound = req.body;
        console.log(req.body)
        s3.getObject(params, (err, data) => {
            //LINE BELOW NEEDED SOME TINKERING TO PROPERLY DE-ENCODE
            let objectData = JSON.parse(data.Body.toString('utf-8'));
            console.log(objectData.emailHash)
            let validationCheck = bcrypt.compare(inbound.email, objectData.emailHash) 
            && bcrypt.compare(inbound.password, objectData.passwordHash)
            if (err) console.error(err + "getLoginInfo error");
            else if(validationCheck){
               console.log('yeet')
               //res.send({token: 'welcome'}) 
               //git push test save
            }
            else {
                
                console.log("passwords don't match try again")
            }
        });
    });


module.exports = router;