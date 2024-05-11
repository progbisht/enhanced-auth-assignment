const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email : {
        type : String,
        required : true,
        lowercase: true,
        unique: true,
        trim: true
    },

    fullName : {
        type : String,
        required : true,
        trim: true
    },

    bio : {
        type : String,
        trim: true
    },
    
    photo : {
        type : String,
        required : true
    },

    phone : {
        type : Number,
        required : true
    },
    
    password : {
        type : String,
        required : [true, "Password is required"]
    },
    
    isPublic : {
        type: Boolean,
        default: false
    },

    roles : {
        User : {
            type : Number,
            default : 1000
        },
        Admin : Number
    },


    refreshToken : String
});

module.exports = mongoose.model('User',userSchema)