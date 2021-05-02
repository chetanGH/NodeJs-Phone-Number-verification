const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    phone:{
        type:String,
        index:true,
        unique:true
    },
    otp:Number,
    hash:mongoose.Schema.Types.Mixed
});
userSchema.set('timestamps',true)


mongoose.model('userSchema',userSchema,'users');

module.exports = {
    userSchema:userSchema
}