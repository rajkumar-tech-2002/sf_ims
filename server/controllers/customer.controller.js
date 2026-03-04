const Customer = require('../models/customer.model');

const getAllCustomers = async (req, res) => {
    try {
        const customers = await Customer.getAll();
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch customers' });
    }
};

const getCustomerById = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) return res.status(404).json({ message: 'Customer not found' });
        res.json(customer);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch customer' });
    }
};

const createCustomer = async (req, res) => {
    try {
        const customerId = await Customer.create(req.body);
        res.status(201).json({ id: customerId, message: 'Customer created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create customer' });
    }
};

const updateCustomer = async (req, res) => {
    try {
        const success = await Customer.update(req.params.id, req.body);
        if (!success) return res.status(404).json({ message: 'Customer not found' });
        res.json({ message: 'Customer updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update customer' });
    }
};

const deleteCustomer = async (req, res) => {
    try {
        const success = await Customer.delete(req.params.id);
        if (!success) return res.status(404).json({ message: 'Customer not found' });
        res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete customer' });
    }
};

module.exports = {
    getAllCustomers,
    getCustomerById,
    createCustomer,
    updateCustomer,
    deleteCustomer
};
