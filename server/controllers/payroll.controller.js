const User = require('../models/user.model');
const Attendance = require('../models/attendance.model');
const SalarySlip = require('../models/salary.model');
const pool = require('../config/db.config');

// --- Employees ---
exports.getEmployees = async (req, res) => {
    try {
        const employees = await User.getAll();
        res.status(200).json(employees);
    } catch (err) {
        console.error('Error fetching employees:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.createEmployee = async (req, res) => { res.status(405).json({ message: 'Use users endpoint' }); };
exports.updateEmployee = async (req, res) => { res.status(405).json({ message: 'Use users endpoint' }); };
exports.deleteEmployee = async (req, res) => { res.status(405).json({ message: 'Use users endpoint' }); };

// --- Banks ---
exports.getBanks = async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT id, bank_name FROM bank_name_master ORDER BY bank_name ASC');
        res.status(200).json(rows);
    } catch (err) {
        console.error('Error fetching banks:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// --- Attendance ---
exports.getAttendance = async (req, res) => {
    try {
        const { month, year } = req.query; // optional filters
        const records = await Attendance.getAll(month, year);
        res.status(200).json(records);
    } catch (err) {
        console.error('Error fetching attendance:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.markAttendance = async (req, res) => {
    try {
        await Attendance.markAttendance(req.body);
        res.status(201).json({ message: 'Attendance marked successfully' });
    } catch (err) {
        console.error('Error marking attendance:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// --- Salary Processing ---
exports.getSalarySlips = async (req, res) => {
    try {
        const { month, year } = req.query;
        const slips = await SalarySlip.getAll(month, year);
        res.status(200).json(slips);
    } catch (err) {
        console.error('Error fetching salary slips:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.generateSalarySlip = async (req, res) => {
    try {
        const { employee_id, month, year } = req.body;
        
        // Find user to get basic salary
        const employee = await User.findById(employee_id);
        if (!employee) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find attendance to calculate days present
        const attendanceRecords = await Attendance.getByEmployeeAndMonth(employee_id, month, year);
        
        const workingDays = new Date(year, month, 0).getDate(); // Days in the month
        let presentDays = 0;
        
        attendanceRecords.forEach(record => {
            if (record.status === 'Present' || record.status === 'Paid Leave') presentDays += 1;
            if (record.status === 'Half-Day') presentDays += 0.5;
        });

        // Simplified calculation: calculate based on present days
        const basic_salary = parseFloat(employee.basic_salary) || 0;
        const perDaySalary = basic_salary / workingDays;
        
        // We can just keep basic as the full basic and calculate deductions for absences
        const absentDays = workingDays - presentDays;
        const deductions = (absentDays > 0) ? Math.round(absentDays * perDaySalary * 100) / 100 : 0;
        
        const allowances = parseFloat(req.body.allowances) || 0; // manual extra allowances
        
        const net_salary = Math.round((basic_salary + allowances - deductions) * 100) / 100;

        const salaryData = {
            employee_id,
            month,
            year,
            basic_salary,
            allowances,
            deductions,
            net_salary,
            payment_status: 'Pending'
        };

        await SalarySlip.generate(salaryData);
        res.status(201).json({ message: 'Salary slip generated successfully', data: salaryData });
    } catch (err) {
        console.error('Error generating salary:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.updateSalaryStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const date = status === 'Paid' ? new Date().toISOString().split('T')[0] : null;
        const success = await SalarySlip.updatePaymentStatus(req.params.id, status, date);
        if (success) {
            res.status(200).json({ message: 'Salary status updated' });
        } else {
            res.status(404).json({ message: 'Salary slip not found' });
        }
    } catch (err) {
        console.error('Error updating salary status:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
