const mongoose = require('mongoose');
const moment = require('moment-timezone');

const dateIndia = moment.tz(Date.now(), 'Asia/Kolkata');

const postSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    cloudinaryId: {
        type: String,
        default: ''
    },
    hashtags: {
        type: [String],
        default: []
    },
    taggedUsers: {
        type: [mongoose.Schema.Types.ObjectId],
        default: []
    },
    postStatus: {
        type: String,
        required: true
    },
    createdAt: {
        type: String,
        default: dateIndia.toString()
    },
    likes: {
        type: [{
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            createdAt: {
                type: Date,
                default: Date.now
            },
        }],
    },
    comments: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        content: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;