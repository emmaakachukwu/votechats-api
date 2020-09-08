const mongoose = require("mongoose")

const Recover = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },

    code: {
        type: String,
    },

    recoveryCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true })

module.exports = mongoose.model('recover', Recover)