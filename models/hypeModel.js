const mongoose = require("mongoose")

const Hype = new mongoose.Schema({
    postedBy: {
        type: mongoose.Schema.Types,
        ref: 'user',
        required: true
    },

    hype: {
        type: String,
        required: true
    },

    image_urls: {
        type: Array
    },

    edited: {
        type: Boolean,
        default: false
    },

    likes: [
        {
            likedBy: {
                type: mongoose.Schema.Types,
                ref: 'user'
            },

            timeLiked: {
                type: Date
            }
        }
    ],

    rehypes: [
        {
            rehypedBy: {
                type: mongoose.Schema.Types,
                ref: 'user'
            },

            timeRehyped: {
                type: Date
            }
        }
    ],

    deleted: {
        type: Boolean,
        default: false
    }
}, {timestamps: true})

module.exports = mongoose.model('hype', Hype)