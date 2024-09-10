const mongoose = require('mongoose');

const connectToDatabase = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/EmployeeDB', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB Connection Succeeded.');
    } catch (err) {
        console.log('Error in DB connection : ' + err);
    }
};

connectToDatabase();

require('./employee.model'); 
