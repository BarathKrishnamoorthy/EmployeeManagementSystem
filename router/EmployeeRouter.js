const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');

// Render sign-up form
router.get('/employee/signup', employeeController.renderSignUpForm);

// Handle sign-up form submission
router.post('/employee/signup', employeeController.empSign);

// Render login form
router.get('/employee/login', employeeController.renderLoginForm);

// Handle login form submission
router.post('/employee/login', employeeController.empLogin);

// Render add/edit form
router.get('/employee/addOrEdit/:id?', employeeController.renderForm);

// Handle form submission (both insert and update)
router.post('/employee/addOrEdit', employeeController.handleFormSubmission);

// List all employees, with optional date filters
router.get('/employee/list', employeeController.listEmployees);

// Find an employee by _id and render edit form
router.get('/employee/edit/:id', employeeController.findEmployeeById);

// Delete an employee by _id
router.get('/employee/delete/:id', employeeController.deleteEmployeeById);

// View employee details by email
router.get('/employee/view/:email', employeeController.viewEmployeeByEmail);



router.post('/employee/setInactive/:id', employeeController.inactive);



// View activity log
router.get('/employee/activity-log', employeeController.viewActivityLog);





// Handle logout
router.get('/employee/logout', employeeController.empLogout);

router.get('/list', employeeController.filterByStatus);
module.exports = router;
