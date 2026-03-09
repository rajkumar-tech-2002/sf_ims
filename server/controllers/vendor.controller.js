const Vendor = require('../models/vendor.model');

const getAllVendors = async (req, res) => {
    try {
        const vendors = await Vendor.findAll();
        res.status(200).json(vendors);
    } catch (error) {
        console.error('Error fetching vendors:', error);
        res.status(500).json({ message: 'Error fetching vendors' });
    }
};

const createVendor = async (req, res) => {
    try {
        const { vendor_name, vendor_phone } = req.body;

        if (!vendor_name || !vendor_phone) {
            return res.status(400).json({ message: 'Vendor name and phone are required' });
        }

        const vendorId = await Vendor.create(req.body);
        res.status(201).json({
            message: 'Vendor created successfully',
            vendorId
        });
    } catch (error) {
        console.error('Error creating vendor:', error);
        res.status(500).json({ message: 'Error creating vendor' });
    }
};

const updateVendor = async (req, res) => {
    try {
        const { id } = req.params;
        const { vendor_name, vendor_phone } = req.body;

        if (!vendor_name || !vendor_phone) {
            return res.status(400).json({ message: 'Vendor name and phone are required' });
        }

        const updated = await Vendor.update(id, req.body);
        if (updated) {
            res.status(200).json({ message: 'Vendor updated successfully' });
        } else {
            res.status(404).json({ message: 'Vendor not found' });
        }
    } catch (error) {
        console.error('Error updating vendor:', error);
        res.status(500).json({ message: 'Error updating vendor' });
    }
};

const deleteVendor = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Vendor.delete(id);
        if (deleted) {
            res.status(200).json({ message: 'Vendor deleted successfully' });
        } else {
            res.status(404).json({ message: 'Vendor not found' });
        }
    } catch (error) {
        console.error('Error deleting vendor:', error);
        res.status(500).json({ message: 'Error deleting vendor' });
    }
};

module.exports = {
    getAllVendors,
    createVendor,
    updateVendor,
    deleteVendor
};
