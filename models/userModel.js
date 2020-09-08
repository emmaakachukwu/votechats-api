const mongoose = require("mongoose")

const User = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },

    username: {
        type: String,
        unique: true,
        required: true
    },

    password: {
        type: String,
        required: true
    },

    full_name: {
        type: String
    },

    birthday: {
        type: String
    },

    city: {
        type: String
    },

    sex: {
        type: String
    },

    bio: {
        type: String,
        default: 'Hey, Votechats rocks!'
    },

    image_url: {
        type: String
    },

    updatedProfile: {
        type: Boolean,
        default: false
    },

    deleted: {
        type: Boolean,
        default: false
    },

    followings: [
        {
            user: {
                type: mongoose.Schema.Types,
                ref: 'user'
            },

            timeFollowed: {
                type: Date
            }
        }
    ],

    followers: [
        {
            user: {
                type: mongoose.Schema.Types,
                ref: 'user'
            },

            timeFollowed: {
                type: Date
            }
        }
    ]
}, { timestamps: true })

module.exports = mongoose.model('user', User)