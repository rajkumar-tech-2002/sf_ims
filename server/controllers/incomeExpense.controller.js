const IncomeExpense = require('../models/incomeExpense.model');

const IncomeExpenseController = {
    createEntry: async (req, res) => {
        try {
            const entryId = await IncomeExpense.save(req.body);
            res.status(201).json({
                message: 'Transaction saved successfully',
                id: entryId
            });
        } catch (error) {
            console.error('Error in createEntry:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    getEntries: async (req, res) => {
        try {
            const entries = await IncomeExpense.findAll();
            res.status(200).json(entries);
        } catch (error) {
            console.error('Error in getEntries:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    getDistinctFields: async (req, res) => {
        try {
            const fields = await IncomeExpense.getDistinctFields();
            res.status(200).json(fields);
        } catch (error) {
            console.error('Error in getDistinctFields:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    updateEntry: async (req, res) => {
        try {
            const success = await IncomeExpense.update(req.params.id, req.body);
            if (success) {
                res.status(200).json({ message: 'Transaction updated successfully' });
            } else {
                res.status(404).json({ message: 'Transaction not found' });
            }
        } catch (error) {
            console.error('Error in updateEntry:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    deleteEntry: async (req, res) => {
        try {
            const success = await IncomeExpense.delete(req.params.id);
            if (success) {
                res.status(200).json({ message: 'Transaction deleted successfully' });
            } else {
                res.status(404).json({ message: 'Transaction not found' });
            }
        } catch (error) {
            console.error('Error in deleteEntry:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    getReport: async (req, res) => {
        try {
            const { fromDate, toDate } = req.query;
            if (!fromDate || !toDate) {
                return res.status(400).json({ message: 'From Date and To Date are required' });
            }
            const reportData = await IncomeExpense.getReport(fromDate, toDate);
            res.status(200).json(reportData);
        } catch (error) {
            console.error('Error in getReport:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
};

module.exports = IncomeExpenseController;
