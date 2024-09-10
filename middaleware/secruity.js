const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Employee = require('../models/employee.model');
const bcrypt = require('bcrypt');

// Configure the local strategy
passport.use(new LocalStrategy(
    
    async (email, password, done) => {
        try {
            const employee = await Employee.findOne({ email });
            if (!employee) {
                return done(null, false, { message: 'No user with that email' });
            }

            const isMatch = await bcrypt.compare(password, employee.password);
            if (!isMatch) {
                return done(null, false, { message: 'Password incorrect' });
            }

            return done(null, employee);
        } catch (error) {
            return done(error);
        }
    }
));

// Serialize user information to store in the session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user information from the session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await Employee.findById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});
