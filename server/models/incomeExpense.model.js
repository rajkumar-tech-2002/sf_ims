const db = require('../config/db.config');

const IncomeExpense = {
    save: async (data) => {
        const query = `
            INSERT INTO income_expense 
            (income_expense_date, group_name, category_name, person_name, authorization_name, income_expense_type, details, bill_no, income, expense)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            data.income_expense_date,
            data.group_name,
            data.category_name,
            data.person_name,
            data.authorization_name,
            data.income_expense_type,
            data.details,
            data.bill_no || '',
            data.income || 0,
            data.expense || 0
        ];
        const [result] = await db.execute(query, values);
        return result.insertId;
    },

    findAll: async () => {
        const [rows] = await db.execute('SELECT * FROM income_expense ORDER BY income_expense_date DESC, id DESC');
        return rows;
    },

    getDistinctFields: async () => {
        const [groups] = await db.execute('SELECT DISTINCT group_name FROM income_expense WHERE group_name != ""');
        const [categories] = await db.execute('SELECT DISTINCT category_name FROM income_expense WHERE category_name != ""');
        const [persons] = await db.execute('SELECT DISTINCT person_name FROM income_expense WHERE person_name != ""');
        const [authorizations] = await db.execute('SELECT DISTINCT authorization_name FROM income_expense WHERE authorization_name != ""');

        return {
            groups: groups.map(r => r.group_name),
            categories: categories.map(r => r.category_name),
            persons: persons.map(r => r.person_name),
            authorizations: authorizations.map(r => r.authorization_name)
        };
    },

    update: async (id, data) => {
        const query = `
            UPDATE income_expense 
            SET income_expense_date = ?, group_name = ?, category_name = ?, person_name = ?, 
                authorization_name = ?, income_expense_type = ?, details = ?, bill_no = ?, 
                income = ?, expense = ?
            WHERE id = ?
        `;
        const values = [
            data.income_expense_date,
            data.group_name,
            data.category_name,
            data.person_name,
            data.authorization_name,
            data.income_expense_type,
            data.details,
            data.bill_no || '',
            data.income || 0,
            data.expense || 0,
            id
        ];
        const [result] = await db.execute(query, values);
        return result.affectedRows > 0;
    },

    delete: async (id) => {
        const [result] = await db.execute('DELETE FROM income_expense WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
};

module.exports = IncomeExpense;
