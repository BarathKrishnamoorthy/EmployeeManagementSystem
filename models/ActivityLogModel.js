const mongoose = require('mongoose');
const activityLogSchema = new mongoose.Schema({
    name: {
        type: String,

    },
    email: {
        type: String,
    },
    action: {
        type: String,
        enum: ['SignUP', 'login', 'logout', 'AddUser'],
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },

    title: {
        type: String
    },
    description: {
        type: String
    },

});

module.exports = mongoose.model('ActivityLog', activityLogSchema);
