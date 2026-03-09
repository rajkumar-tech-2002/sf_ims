CREATE TABLE IF NOT EXISTS stock_return_master (
    id INT AUTO_INCREMENT PRIMARY KEY,
    return_no VARCHAR(20) UNIQUE NOT NULL,
    return_date DATE NOT NULL,
    bill_no VARCHAR(20) NOT NULL,
    customer_id VARCHAR(20),
    customer_name VARCHAR(100),
    mobile_no VARCHAR(15),
    total_amount DECIMAL(15,2) DEFAULT 0,
    is_credit BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stock_return_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    return_id INT NOT NULL,
    product_code VARCHAR(50) NOT NULL,
    product_name VARCHAR(255),
    bill_date DATE,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    return_qty DECIMAL(15,2) DEFAULT 0,
    amount DECIMAL(15,2) DEFAULT 0,
    stock_at_return DECIMAL(15,2) DEFAULT 0,
    FOREIGN KEY (return_id) REFERENCES stock_return_master(id) ON DELETE CASCADE
);
