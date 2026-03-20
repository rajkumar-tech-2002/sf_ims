SET FOREIGN_KEY_CHECKS=0;

-- Drop existing tables that depend on employees or ARE employees
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS salary_slips;
DROP TABLE IF EXISTS employees;

-- Alter users table
ALTER TABLE users 
ADD COLUMN bank_name VARCHAR(100) NULL,
ADD COLUMN bank_account VARCHAR(50) NULL,
ADD COLUMN ifsc_code VARCHAR(20) NULL,
ADD COLUMN other_bank_account VARCHAR(50) NULL,
ADD COLUMN basic_salary DECIMAL(10, 2) DEFAULT 0.00,
ADD COLUMN join_date DATE NULL;

-- Recreate attendance referencing users.id
CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    date DATE NOT NULL,
    status ENUM('Present', 'Absent', 'Half-Day', 'Paid Leave') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_employee_date (employee_id, date),
    FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Recreate salary_slips referencing users.id
CREATE TABLE IF NOT EXISTS salary_slips (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    month INT NOT NULL,
    year INT NOT NULL,
    basic_salary DECIMAL(10, 2) DEFAULT 0.00,
    allowances DECIMAL(10, 2) DEFAULT 0.00,
    deductions DECIMAL(10, 2) DEFAULT 0.00,
    net_salary DECIMAL(10, 2) DEFAULT 0.00,
    payment_status ENUM('Pending', 'Paid') DEFAULT 'Pending',
    payment_date DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_employee_month_year (employee_id, month, year),
    FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE
);

SET FOREIGN_KEY_CHECKS=1;
