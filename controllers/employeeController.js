const mongoose = require('mongoose');
const Employee = mongoose.model('Employee');
const ActivityLog = require('../models/ActivityLogModel');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const handlebars = require('handlebars');
handlebars.registerHelper('eq', function (a, b) {
    return a === b;
});
handlebars.registerHelper('add', (a, b) => a + b);
handlebars.registerHelper('subtract', (a, b) => a - b);
handlebars.registerHelper('gt', (a, b) => a > b);
handlebars.registerHelper('lt', (a, b) => a < b);

// Signup
exports.renderSignUpForm = (req, res) => {
    res.render("employee/signUp", {
        viewTitle: "Sign Up Employee"
    });
};

// Signup
exports.empSign = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        let errors = {};
        if (!name) {
            errors.nameError = 'Name is required';
        }
        if (!email) {
            errors.emailError = 'Email is required';
        } else {
            const existingEmployee = await Employee.findOne({ email });
            if (existingEmployee) {
                errors.emailError = 'Email is already registered';
            }
        }
        if (!password) {
            errors.passwordError = 'Password is required';
        }
        if (Object.keys(errors).length > 0) {
            return res.render('employee/signup', {
                viewTitle: "Employee Signup",
                employee: req.body,
                ...errors
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newEmployee = new Employee({
            name,
            email,
            password: hashedPassword,
            status: 'inactive'
        });

        await newEmployee.save();

        // Set session data
        req.session.employee = { id: newEmployee._id, email: newEmployee.email, name: newEmployee.name };
        req.session.name = name;

        /* await ActivityLog.create({
             name: newEmployee.name,
             email: newEmployee.email,
             action: 'SignUP',
             status: 'inactive'
         });*/

        res.redirect('/employee/login');
    } catch (error) {
        console.log('Error during signup:', error);
        res.status(500).send('Error during signup');
    }
};

//getlogin
exports.renderLoginForm = (req, res) => {
    res.render("employee/login", {
        viewTitle: "Login Employee"
    });
};


// Login
exports.empLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        let errors = {};
        if (!email) {
            errors.emailError = 'Email is required';
        }
        if (!password) {
            errors.passwordError = 'Password is required';
        }

        if (Object.keys(errors).length > 0) {
            return res.render('employee/login', {
                viewTitle: "Employee Login",
                employee: req.body,
                emailError: errors.emailError,
                passwordError: errors.passwordError
            });
        }
        const employee = await Employee.findOne({ email: req.body.email });
        if (employee && await bcrypt.compare(req.body.password, employee.password)) {
            req.session.employee = { id: employee._id, email: employee.email, name: employee.name };

            employee.status = 'active';
            await employee.save();

            await ActivityLog.create({
                name: req.session.name,
                email: employee.email,
                action: 'login',
                status: 'active'
            });

            return res.redirect('/employee/list');
        } else {

            return res.render('employee/login', {
                viewTitle: "Employee Login",
                employee: req.body,
                flash: 'Invalid email or password'
            });
        }
    } catch (error) {
        console.log('Error during login:', error);
        res.status(500).send('Error during login');
    }
};

// Logout
exports.empLogout = async (req, res) => {
    try {
        if (req.session && req.session.employee) {
            const employeeId = req.session.employee.id;
            const employee = await Employee.findById(employeeId);
            if (employee) {
                employee.status = 'inactive';
                await employee.save();
                await ActivityLog.create({
                    name: req.session.name,
                    email: employee.email,
                    action: 'logout',
                    status: 'inactive'
                });
            }

            // Destroy the session
            req.session.destroy((err) => {
                if (err) {
                    console.log('Error during logout:', err);
                    return res.status(500).send('Error during logout');
                }
                res.redirect('/employee/login');
            });
        }
    } catch (error) {
        console.log('Error during logout:', error);
        res.status(500).send('Error during logout');
    }
};


exports.viewActivityLog = async (req, res) => {
    try {
        const logs = await ActivityLog.find().sort({ timestamp: -1 }).lean();
        res.render("employee/activityLog", {
            viewTitle: "Employee Activity Log",
            logs
        });
    } catch (error) {
        console.log('Error retrieving activity log:', error);
        res.status(500).send('Error retrieving activity log');
    }
};

exports.renderForm = (req, res) => {
    res.render("employee/addOrEdit", {
        viewTitle: req.params.id ? "Update Employee" : "Insert Employee",
        employee: {}
    });
};

//edit or add
exports.handleFormSubmission = async (req, res) => {
    try {
        if (!req.body._id) {
            await insertRecord(req, res);
        } else {
            await updateRecord(req, res);
        }
    } catch (err) {
        console.log('Error handling form submission:', err);
    }
};

async function insertRecord(req, res) {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

        const createdBy = req.session && req.session.employee ? req.session.employee.id : null;
        if (!createdBy) {
            return res.status(401).send('Unauthorized: Please log in to add a new employee.');
        }
        const newEmployee = new Employee({
            fullName: req.session.name,
            email: req.body.email,
            password: hashedPassword,
            mobile: req.body.mobile,
            city: req.body.city,
            address: req.body.address,
            country: req.body.country,
            status: 'active',
            createdBy: createdBy
        });
        await newEmployee.save();
        await ActivityLog.create({
            name: req.body.fullName,
            email: req.body.email,
            action: 'AddUser',
            status: 'active'
        });

        res.redirect('/employee/list');
    } catch (err) {
        if (err.name === 'ValidationError') {
            handleValidationError(err, req.body);
            res.render("employee/addOrEdit", {
                viewTitle: "Insert Employee",
                employee: req.body
            });
        } else {
            console.log('Error during record insertion:', err);
            res.status(500).send('Error inserting record');
        }
    }
}
; function handleValidationError(err, body) {
    for (field in err.errors) {
        switch (err.errors[field].path) {
            case 'fullName':
                body['fullNameError'] = err.errors[field].message;
                break;
            case 'email':
                body['emailError'] = err.errors[field].message;
                break;
            case 'mobile':
                body['mobileError'] = err.errors[field].message;
                break;
            case 'password':
                body['passwordError'] = err.errors[field].message;
                break;
            default:
                break;
        }
    }
}

async function updateRecord(req, res) {
    try {
        await Employee.findByIdAndUpdate(req.body._id, req.body, { new: true });
        res.redirect('/employee/list');
    } catch (err) {
        if (err.name === 'ValidationError') {
            handleValidationError(err, req.body);
            res.render("employee/addOrEdit", {
                viewTitle: 'Update Employee',
                employee: req.body
            });
        } else {
            console.log('Error during record update:', err);
        }
    }
}

//list the user in list.hbs
exports.listEmployees = async (req, res) => {
    try {
        if (!req.session.employee) {
            return res.redirect('/employee/login');
        }
        const employee = await Employee.findById(req.session.employee.id).lean();
        if (!employee) {
            return res.status(404).send('Employee not found');
        }

        res.render("employee/list", {
            docs: [employee],
            activeCount: employee.status === 'active' ? 1 : 0,
            inactiveCount: employee.status === 'inactive' ? 1 : 0
        });
    } catch (err) {
        console.log('Error in retrieving employee list:', err);
        res.status(500).send('Error in retrieving employee list');
    }
};//update the user by using the findbyID 
exports.findEmployeeById = async (req, res) => {
    try {
        const doc = await Employee.findById(req.params.id).lean();
        res.render("employee/addOrEdit", {
            viewTitle: "Update Employee",
            employee: doc
        });
    } catch (err) {
        console.log('Error retrieving employee by id:', err);
    }
};



//delete the user in list
exports.deleteEmployeeById = async (req, res) => {
    try {
        await Employee.findByIdAndDelete(req.params.id);
        res.redirect('/employee/list');
    } catch (err) {
        console.log('Error in employee delete:', err);
    }
};




//view the user information
exports.viewEmployeeByEmail = async (req, res) => {
    try {
        const doc = await Employee.findOne({ email: req.params.email }).lean();
        if (doc) {
            res.render("employee/view", {
                viewTitle: "View Employee",
                employee: doc
            });
        } else {
            res.status(404).send('Employee not found');
        }
    } catch (err) {
        console.log('Error retrieving employee by email:', err);
        res.status(500).send('Error retrieving employee');
    }
};



//filter the start date and end date 
exports.listEmployees = async (req, res) => {
    try {
        const { fromDate, toDate, status, search, page = 1, limit = 10 } = req.query;
        let query = {};

        // Date range filter
        if (fromDate && toDate) {
            query.createdAt = {
                $gte: new Date(fromDate),
                $lte: new Date(new Date(toDate).setHours(23, 59, 59, 999))
            };
        }
        // Status filter
        if (status) {
            query.status = status;
        }
        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { mobile: { $regex: search, $options: 'i' } }
            ];
        }
        const skip = (page - 1) * limit;
        const employees = await Employee.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean();
        const [activeCount, inactiveCount, totalCount] = await Promise.all([
            Employee.countDocuments({ ...query, status: 'active' }),
            Employee.countDocuments({ ...query, status: 'inactive' }),
            Employee.countDocuments(query)
        ]);
        res.render('employee/list', {
            docs: employees,
            activeCount,
            inactiveCount,
            fromDate,
            toDate,
            selectedStatus: status,
            search,
            page: parseInt(page),
            totalPages: Math.ceil(totalCount / limit)
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};


//filter the status
exports.filterByStatus = async (req, res) => {
    try {
        const { status } = req.query;
        let query = {};
        if (status === 'active') {
            query.status = 'active';
        } else if (status === 'inactive') {
            query.status = 'inactive';
        }
        const employees = await Employee.find(query);
        res.render('employee/list', {
            employees,
            selectedStatus: status || ''
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

//inactive button in add or edit 
exports.inactive = async (req, res) => {
    try {
        await Employee.findByIdAndUpdate(req.params.id, { status: 'inactive' });
        res.json({ success: true });
    } catch (error) {
        res.json({ success: false });
    }
};
