var express = require('express');
var router = express.Router();
const ctrl = require('../controllers/basic.controller');
const jwt = require('jsonwebtoken');
const key = "authSecret"; 
/* GET home page. */
router.get('/', function(req, res, next) {
  res.send("Hi there! I'm here to validate your phone numbers. Give me try.")
});

router.route('/signup').post(ctrl.signUp);//signup
router.route('/verifyUser').post(ctrl.verifyUser);//verifyUser
router.route('/requestOTP').post(ctrl.requestOTP);//requestOTP

// Middleware to check jwt token existance in request headers
router.use((req,res,next)=>{
  let token = req.headers['authorization'];
  if(token){
    jwt.verify(token,key,  (err, decode)=>{
      if(err){
          res.status(200).send({success:false,message:err.message})
      }else if(!decode){
          res.status(401).send({success:false,message:'Unauthorized access.'})
      }else{
        next();
      }
    })
  }else{
    res.status(400).send({success:false,message:'Bad request.'})
  }
})

router.route('/getInfo').get(ctrl.getUserInfo)//getUserInfo

module.exports = router;
