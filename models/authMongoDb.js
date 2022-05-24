const dotenv = require('dotenv').config();
var express = require("express");
const { append } = require('express/lib/response');
var router = express.Router();
const DB_URI = process.env.DB_URI

console.log("authMongoDb---------")

function login(email, password, callback) {
    const bcrypt = require('bcrypt');
    const MongoClient = require('mongodb@3.1.4').MongoClient;
    const client = new MongoClient(DB_URI);
  
    client.connect(function (err) {
      if (err) return callback(err);
  
      const db = client.db('nextDayBeats');
      const users = db.collection('users');
  
      users.findOne({ email: email }, function (err, user) {
        if (err || !user) {
          client.close();
          return callback(err || new WrongUsernameOrPasswordError(email));
        }
  
        bcrypt.compare(password, user.password, function (err, isValid) {
          client.close();
  
          if (err || !isValid) return callback(err || new WrongUsernameOrPasswordError(email));
  
          return callback(null, {
              user_id: user._id.toString(),
              nickname: user.nickname,
              email: user.email
            });
        });
      });
    });
  }

  function create(user, callback) {
    const bcrypt = require('bcrypt');
    const MongoClient = require('mongodb@3.1.4').MongoClient;
    const client = new MongoClient(DB_URI);
  
    client.connect(function (err) {
      if (err) return callback(err);
  
      const db = client.db('nextDayBeats');
      const users = db.collection('users');
  
      users.findOne({ email: user.email }, function (err, withSameMail) {
        if (err || withSameMail) {
          client.close();
          return callback(err || new Error('the user already exists'));
        }
  
        bcrypt.hash(user.password, 10, function (err, hash) {
          if (err) {
            client.close();
            return callback(err);
          }
  
          user.password = hash;
          users.insert(user, function (err, inserted) {
            client.close();
  
            if (err) return callback(err);
            callback(null);
          });
        });
      });
    });
  }
  




module.exports = router;