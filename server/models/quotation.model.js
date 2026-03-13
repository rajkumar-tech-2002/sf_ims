const db = require('../config/db.config');

const Quotation = {
    getNextQuotationNo: async () => {
        const [rows] = await db.execute('SELECT quotation_no FROM quotation_master ORDER BY id DESC LIMIT 1');
        if (rows.length === 0) return 'QTN-0001';

        const lastNo = rows[0].quotation_no;
        const match = lastNo.match(/QTN-(\d+)/);
        const nextNum = match ? parseInt(match[1]) + 1 : 1;
        return `QTN-${String(nextNum).padStart(4, '0')}`;
    },

    save: async (data) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Upsert into customer_details
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

            // 2. Insert into quotation_master
            const masterQuery = `
                INSERT INTO quotation_master 
                (quotation_no, quotation_date, customer_id, customer_name, gst_no, address, mobile_no, contact_number, state, state_code, subtotal, gst_total, round_off, grand_total, gst_mode)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const masterValues = [
                data.quotation_no,
                data.quotation_date,
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
            const quotationId = masterResult.insertId;

            // 3. Insert items into quotation_items
            const itemQuery = `
                INSERT INTO quotation_items 
                (quotation_id, product_code, product_name, hsn_code, description, qty, price, discount_percent, taxable_amount, gst_percent, cgst_amount, sgst_amount, igst_amount, total_amount)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            for (const item of data.items) {
                const itemValues = [
                    quotationId,
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
            }

            await connection.commit();
            return quotationId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    getProductByCode: async (code) => {
        const [rows] = await db.execute('SELECT * FROM stock_master WHERE product_code = ?', [code]);
        return rows[0];
    },

    findAll: async () => {
        const [rows] = await db.execute('SELECT * FROM quotation_master ORDER BY created_at DESC');
        return rows;
    },

    findAllDetailed: async () => {
        const query = `
            SELECT 
                qm.*, 
                qi.product_code, 
                qi.product_name, 
                qi.hsn_code, 
                qi.description, 
                qi.qty, 
                qi.price, 
                qi.discount_percent, 
                qi.taxable_amount, 
                qi.gst_percent, 
                qi.cgst_amount, 
                qi.sgst_amount, 
                qi.igst_amount,
                qi.total_amount as item_total_amount
            FROM quotation_master qm
            JOIN quotation_items qi ON qm.id = qi.quotation_id
            ORDER BY qm.created_at DESC
        `;
        const [rows] = await db.execute(query);
        return rows;
    },

    findByNo: async (quotationNo) => {
        const [master] = await db.execute('SELECT * FROM quotation_master WHERE quotation_no = ?', [quotationNo]);
        if (master.length === 0) return null;

        const [items] = await db.execute('SELECT * FROM quotation_items WHERE quotation_id = ?', [master[0].id]);
        return { ...master[0], items };
    }
};

module.exports = Quotation;
