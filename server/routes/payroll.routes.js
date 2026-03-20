const express = require('express');
const router = express.Router();
const { authMiddleware: checkAuth } = require('../middleware/auth.middleware');
const {
    getEmployees, createEmployee, updateEmployee, deleteEmployee,
    getAttendance, markAttendance,
    getSalarySlips, generateSalarySlip, updateSalaryStatus,
    getBanks
} = require('../controllers/payroll.controller');

// --- Banks ---
router.get('/banks', checkAuth, getBanks);

// Employees
router.get('/employees', checkAuth, getEmployees);
router.post('/employees', checkAuth, createEmployee);
router.put('/employees/:id', checkAuth, updateEmployee);
router.delete('/employees/:id', checkAuth, deleteEmployee);

// Attendance
router.get('/attendance', checkAuth, getAttendance);
router.post('/attendance', checkAuth, markAttendance);

// Salary Slips
router.get('/salary', checkAuth, getSalarySlips);
router.post('/salary/generate', checkAuth, generateSalarySlip);
router.put('/salary/:id/status', checkAuth, updateSalaryStatus);

module.exports = router;
