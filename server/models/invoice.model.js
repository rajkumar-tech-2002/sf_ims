const db = require('../config/db.config');

const Invoice = {
    getNextInvoiceNo: async () => {
        const [rows] = await db.execute('SELECT invoice_no FROM invoice_master ORDER BY id DESC LIMIT 1');
        if (rows.length === 0) return 'INV-0001';

        const lastNo = rows[0].invoice_no;
        const match = lastNo.match(/INV-(\d+)/);
        const nextNum = match ? parseInt(match[1]) + 1 : 1;
        return `INV-${String(nextNum).padStart(4, '0')}`;
    },

    save: async (data) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Upsert into customer_details (maintained for consistency)
            let customerId = data.customer_id;
            if (!customerId) {
                const [rows] = await connection.execute('SELECT MAX(id) as lastId FROM customer_details');
                const nextId = (rows[0].lastId || 0) + 1;
                customerId = `CUST-${String(nextId).padStart(3, '0')}`;
            }

            const customerQuery = `
                INSERT INTO customer_details 
                (customer_id, customer_name, customer_address, customer_mobile, customer_contact, state, state_code, gst_no)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                customer_address = VALUES(customer_address),
                customer_mobile = VALUES(customer_mobile),
                customer_contact = VALUES(customer_contact),
                state = VALUES(state),
                state_code = VALUES(state_code),
                gst_no = VALUES(gst_no)
            `;
            const customerValues = [
                customerId,
                data.customer_name,
                data.address,
                data.mobile_no,
                data.customer_contact,
                data.state,
                data.state_code,
                data.gst_no
            ];
            await connection.execute(customerQuery, customerValues);

            // 2. Insert into invoice_master
            const masterQuery = `
                INSERT INTO invoice_master 
                (invoice_no, invoice_date, customer_id, customer_name, gst_no, address, mobile_no, contact_number, state, state_code, subtotal, gst_total, round_off, grand_total, gst_mode)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const masterValues = [
                data.invoice_no,
                data.invoice_date,
                customerId,
                data.customer_name,
                data.gst_no,
                data.address,
                data.mobile_no,
                data.customer_contact,
                data.state,
                data.state_code,
                data.subtotal,
                data.gst_total,
                data.round_off,
                data.grand_total,
                data.gst_mode
            ];
            const [masterResult] = await connection.execute(masterQuery, masterValues);
            const invoiceId = masterResult.insertId;

            // 3. Insert items into invoice_items
            const itemQuery = `
                INSERT INTO invoice_items 
                (invoice_id, product_code, product_name, hsn_code, description, qty, price, discount_percent, taxable_amount, gst_percent, cgst_amount, sgst_amount, igst_amount, total_amount)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            for (const item of data.items) {
                const itemValues = [
                    invoiceId,
                    item.product_code,
                    item.product_name,
                    item.hsn_code,
                    item.description,
                    item.qty,
                    item.price,
                    item.discount_percent,
                    item.taxable_amount,
                    item.gst_percent,
                    item.cgst_amount,
                    item.sgst_amount,
                    item.igst_amount,
                    item.total_amount
                ];
                await connection.execute(itemQuery, itemValues);

                // 4. Reduce stock quantity
                const stockUpdateQuery = `
                    UPDATE stock_master 
                    SET qty = qty - ? 
                    WHERE product_code = ?
                `;
                await connection.execute(stockUpdateQuery, [item.qty, item.product_code]);
            }

            await connection.commit();
            return invoiceId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    findAll: async () => {
        const [rows] = await db.execute('SELECT * FROM invoice_master ORDER BY created_at DESC');
        return rows;
    },

    getByNo: async (invoiceNo) => {
        const [master] = await db.execute('SELECT * FROM invoice_master WHERE invoice_no = ?', [invoiceNo]);
        if (master.length === 0) return null;

        const [items] = await db.execute('SELECT * FROM invoice_items WHERE invoice_id = ?', [master[0].id]);
        return {
            ...master[0],
            items
        };
    }
};

module.exports = Invoice;
