const Transaction = require('../models/transaction.model');

const TransactionController = {
    create: async (req, res) => {
        try {
            const transactionId = await Transaction.create(req.body);
            res.status(201).json({
                message: 'Transaction saved successfully',
                id: transactionId
            });
        } catch (error) {
            console.error('Error in TransactionController.create:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    findAll: async (req, res) => {
        try {
            const transactions = await Transaction.findAll();
            res.status(200).json(transactions);
        } catch (error) {
            console.error('Error in TransactionController.findAll:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    findById: async (req, res) => {
        try {
            const transaction = await Transaction.findById(req.params.id);
            if (!transaction) {
                return res.status(404).json({ message: 'Transaction not found' });
            }
            res.status(200).json(transaction);
        } catch (error) {
            console.error('Error in TransactionController.findById:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    update: async (req, res) => {
        try {
            const success = await Transaction.update(req.params.id, req.body);
            if (success) {
                res.status(200).json({ message: 'Transaction updated successfully' });
            } else {
                res.status(404).json({ message: 'Transaction not found' });
            }
        } catch (error) {
            console.error('Error in TransactionController.update:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    delete: async (req, res) => {
        try {
            const success = await Transaction.delete(req.params.id);
            if (success) {
                res.status(200).json({ message: 'Transaction deleted successfully' });
            } else {
                res.status(404).json({ message: 'Transaction not found' });
            }
        } catch (error) {
            console.error('Error in TransactionController.delete:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
};

module.exports = TransactionController;
