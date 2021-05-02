const accountSid = "Twilio Account SID";
const authToken = "Twilio authToken";
const client = require('twilio')(accountSid, authToken);
const Joi = require('joi');
const mongoose = require('mongoose');
const user = mongoose.model('userSchema');
const key = "authSecret"; 
const jwt = require('jsonwebtoken');

// Twilio Send SMS
const sendSMS = (phone,otp)=>{
    return new Promise((resolve,reject)=>{
        client.messages
        .create({
            from: 'Twilio Number',
            to: phone,
            body: `Hi Your OTP is ${otp}`
        })
        .then(
            message => {
                console.log(message.sid + message.status)
                return resolve({ success: true, message: message });
            }
        ).catch(err => {
            console.log(err);
            return reject({ success: false, message: err });
        })
        .done();
    })
}

/**
 * @function createNewOTP Generate a 4 digit numeric OTP
 * @param {Number} phone 
 * @returns Hash
 * @author Chetan Hebsur
 */ 
const createNewOTP = (phone)=>{
    const otp      = Math.floor(1000 + Math.random() * 9000);
    const fullHash = jwt.sign({'phone':phone,'otp':otp},key, { expiresIn: '2m' })
    return {'hash':fullHash,'otp':otp};
}

/**
 * @function verifyOTP Seperate Hash value and expires from the hash returned from the user
 * @param {Number} phone 
 * @param {Mixed} hash 
 * @param {Number with length 4} otp 
 * @returns {Boolean}
 */ 
const verifyOTP = (hash)=>{
   return new Promise((resolve,reject)=>{
        jwt.verify(hash,key,  (err, decode)=>{
            console.log(decode)
            if(err){
                resolve(false);
            }else if(!decode){
                resolve(false);
            }else{
                resolve(true);
            }
        })
    })
}


/**
 * Promise function to validatePhoneNumber.
 * @param {Number} PhoneNumber.
 * @resolve {Object} JSON object with mobile carrier information.
 * @rejects if not matches or exceptions.
 * @author Chetan Hebsur
 * 
 * */ 
const validatePhoneNumber = async(PhoneNumber)=>{
    return new Promise((resove,reject)=>{
        client
        .lookups
        .v1
        .phoneNumbers(PhoneNumber)
        .fetch({countryCode: 'US'})
        .then(phone_number =>{
            resove(phone_number); 
        }).catch((err)=>{
            console.log(err)
            if(err.status == 404){
                reject('Invalid phone number.')
            }else{
                reject(err);
            }
        })
    })
}


/**
 * @function verifyUser // Accepts paylod of otp and token
 * @param {*} req 
 * @param {*} res 
 * @method POST
 * @body {otp,token}
 * @returns Success->"Logged in" with accessToken, Error-> OTP expired 
 */ 
module.exports.verifyUser = async(req,res)=>{
    try {
        const payload = Joi.object().keys({
            otp:Joi.number().min(4).required(),
            token:Joi.any().required()
        })
        let {error,value} = payload.validate(req.body);
        if(error){
            return res.status(200).send({success:false,message:error.details[0].message});
        }
        if(value){
            user.findOne({'hash':value.token,'otp':value.otp}).exec(async(err,data)=>{
                if(err){
                    res.status(500).send({success:false,message:'Internal server error.'})
                }else if(!data){
                    // If user doesn't exists
                    res.status(400).send({success:false,message:'Invalid OTP'});
                }else{
                    let checkStatus = await verifyOTP(value.token);
                    console.log(checkStatus)
                    if(checkStatus == true){
                        let authToken = jwt.sign({'id':`${data._id}`}, key, { expiresIn: '120' })
                        res.status(200).send({success:true,message:'Logged in.',response:authToken})
                    }else{
                        res.status(200).send({success:false,message:'OTP expired, You can generate new OTP.'})
                    }
                }
            })
        }
        
    } catch (error) {
        console.log(error)

        res.status(500).send({success:false,message:'Internal server error.'})
    }
}


/**
 * @function requestOTP // Accepts paylod of phoneNumber
 * @param {*} req 
 * @param {*} res 
 * @method POST
 * @body {phone}
 * @returns Success->"Send OTP " with accessToken 
 */ 
module.exports.requestOTP = (req,res)=>{
    try {
        const payload = Joi.object().keys({
            phone:Joi.string().min(10).required(),
        })
        let {error,value} = payload.validate(req.body);
        if(error){
            return res.status(200).send({success:false,message:error.details[0].message});
        }
        if(value.phone){
            user.findOne({'phone':value.phone}).exec(async(err,data)=>{
                if(err){
                    res.status(500).send({success:false,message:'Internal server error.'})
                }else if(!data){
                    // If user doesn't exists
                    res.status(400).send({success:false,message:`Account doesn't exists.`});
                }else{
                    let {otp,hash} = await createNewOTP(data.phone);
                    data.otp = otp;
                    data.hash = hash;
                    data.save((err,saved)=>{
                        if(err){
                            res.status(500).send({success:false,message:'Internal server error.'})
                        }else{
                            sendSMS(data.phone,otp).then((result)=>{
                                res.status(200).send({success:true,message:`Your OTP is ${otp}`,response:data.hash});
                            })
                        }
                    })
                }
            })
        }
        
    } catch (error) {
        res.status(500).send({success:false,message:'Internal server error.'})
    }
}



module.exports.getUserInfo = (req,res)=>{
    try {
        let token = req.headers['authorization'];
        if(token){
            jwt.verify(token,key,  (err, decode)=>{
                if(err){
                    res.status(200).send({success:false,message:err.message})
                }else{
                    user.findOne({'_id':decode.id}).exec((err,data)=>{
                        if(err){
                            res.status(500).send({success:false,message:'Internal server error.'})
                        }else if(!data){
                            // If user doesn't exists
                            res.status(401).send({success:false,message:'Unauthorized access.'})
                        }else{
                            res.status(200).send({success:true,response:data})
                        }
                    })
                }
            })
        }else{
            res.status(400).send({success:false,message:'Bad request.'})
        }
    } catch (error) {
        res.status(500).send({success:false,message:'Internal server error.'})
    }
}




/**
 * @function signUp // Accepts paylod of phoneNumber
 * @param {*} req 
 * @param {*} res 
 * @method POST
 * @body {phone}
 * @returns Success->"Send OTP " with accessToken 
 */ 
module.exports.signUp = async(req,res)=>{
    try {

        const payload = Joi.object().keys({
            phone:Joi.any().required(),
        })
        
        let {error,value} = payload.validate(req.body);
        if(error){
            return res.status(200).send({success:false,message:error.details[0].message});
        }
        if(value){
            validatePhoneNumber(value.phone).then(async(data)=>{
                
                if(data.phoneNumber != undefined){
                    let {otp,hash} = createNewOTP(data.phoneNumber.toString());
                    console.log(otp)
                    let newUser = new user({
                        'phone':data.phoneNumber,
                        'otp':otp,
                        'hash':hash
                    })
                    await newUser.save((err,saved)=>{
                        if(err){
                            if(err.code == 11000){
                                res.status(200).send({success:false,message:`${err.keyValue.phone} is already taken.`});
                            }else{
                                res.status(200).send({success:false,message:'Failed to add user.'})
                            }
                        }else{
                            sendSMS(data.phoneNumber,otp).then((result)=>{
                                if(result){
                                    res.status(201).send({success:true,message:'User added.',response:hash})
                                }
                            })

                        }
                    });
                }else{
                    res.send(data)
                }
            }).catch((err)=>{
                console.log(err)
                res.status(200).send({success:false,message:err})
            })
        }

        
    } catch (error) {
        console.log(error);
        res.status(500).send({success:false,message:'Internal server error.'})
    }
}