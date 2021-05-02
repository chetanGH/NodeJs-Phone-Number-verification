const mongoose = require('mongoose');
var logger = require('morgan');

mongoose.connect('mongodb URL', {useNewUrlParser: true,useUnifiedTopology: true });
mongoose.connection.on('connect',connection=>{
    logger(connection)
})
mongoose.connection.on('error', err => {
    logger(err)
});

require('./user.schema');