-- Create Invoice Master Table
CREATE TABLE IF NOT EXISTS invoice_master (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_no VARCHAR(50) UNIQUE NOT NULL,
    invoice_date DATE NOT NULL,
    customer_id VARCHAR(50),
    customer_name VARCHAR(255) NOT NULL,
    gst_no VARCHAR(50),
    address TEXT,
    mobile_no VARCHAR(20),
    contact_number VARCHAR(20),
    state VARCHAR(100),
    state_code VARCHAR(10),
    subtotal DECIMAL(15, 2) DEFAULT 0,
    gst_total DECIMAL(15, 2) DEFAULT 0,
    round_off DECIMAL(15, 2) DEFAULT 0,
    grand_total DECIMAL(15, 2) DEFAULT 0,
    gst_mode ENUM('CGST_SGST', 'IGST') DEFAULT 'CGST_SGST',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create Invoice Items Table
CREATE TABLE IF NOT EXISTS invoice_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id INT NOT NULL,
    product_code VARCHAR(50),
    product_name VARCHAR(255) NOT NULL,
    hsn_code VARCHAR(50),
    description TEXT,
    qty DECIMAL(15, 2) DEFAULT 1,
    price DECIMAL(15, 2) DEFAULT 0,
    discount_percent DECIMAL(5, 2) DEFAULT 0,
    taxable_amount DECIMAL(15, 2) DEFAULT 0,
    gst_percent DECIMAL(5, 2) DEFAULT 0,
    cgst_amount DECIMAL(15, 2) DEFAULT 0,
    sgst_amount DECIMAL(15, 2) DEFAULT 0,
    igst_amount DECIMAL(15, 2) DEFAULT 0,
    total_amount DECIMAL(15, 2) DEFAULT 0,
    FOREIGN KEY (invoice_id) REFERENCES invoice_master(id) ON DELETE CASCADE
);
