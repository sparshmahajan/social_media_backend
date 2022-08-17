const mongoose = require('mongoose');
const moment = require('moment-timezone');

const dateIndia = moment.tz(Date.now(), 'Asia/Kolkata');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    createdAt: {
        type: String,
        default: dateIndia.toString()
    },
    gender: {
        type: String,
        required: true
    },
    user_name: {
        type: String,
        required: true,
        unique: true
    },
    phone_number: {
        type: String,
        required: true
    },
    profile: {
        type: String,
        required: true
    },
    liked_posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }],
    commented_posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    blocked_users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    blocked_by: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
});

const User = mongoose.model("User", userSchema);

module.exports = User;