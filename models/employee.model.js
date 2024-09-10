const mongoose = require('mongoose');
var employeeSchema = new mongoose.Schema({
    fullName: {
        type: String,
        minlength: [2, 'Full name must be at least 2 characters long'],
        maxlength: [50, 'Full name can be up to 50 characters long']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        validate: {
            validator: function (val) {
                const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                return emailRegex.test(val);
            },
            message: 'Invalid email format'
        }
    },
    mobile: {
        type: String,
        minlength: [6, 'min must be at least 6 numbers long'],
        maxlength: [12, 'max must can be up to 12 characters long']

    },
    city: {
        type: String,

    },
    address: {
        type: String,
        minlength: [5, 'Address must be at least 5 characters long']
    },
    country: {
        type: String
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        unique: true,


    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'inactive'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee'
    },
});

mongoose.model('Employee', employeeSchema);
