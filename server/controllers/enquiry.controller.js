const Enquiry = require('../models/enquiry.model');

const createEnquiry = async (req, res) => {
    try {
        const enquiryId = await Enquiry.create(req.body);
        res.status(201).json({ message: 'Enquiry added successfully', id: enquiryId });
    } catch (err) {
        console.error('Error creating enquiry:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

const getAllEnquiries = async (req, res) => {
    try {
        const enquiries = await Enquiry.findAll();
        res.json(enquiries);
    } catch (err) {
        console.error('Error fetching enquiries:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateEnquiry = async (req, res) => {
    try {
        const { id } = req.params;
        const success = await Enquiry.update(id, req.body);
        if (success) {
            res.json({ message: 'Enquiry updated successfully' });
        } else {
            res.status(404).json({ message: 'Enquiry not found' });
        }
    } catch (err) {
        console.error('Error updating enquiry:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteEnquiry = async (req, res) => {
    try {
        const { id } = req.params;
        const success = await Enquiry.delete(id);
        if (success) {
            res.json({ message: 'Enquiry deleted successfully' });
        } else {
            res.status(404).json({ message: 'Enquiry not found' });
        }
    } catch (err) {
        console.error('Error deleting enquiry:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createEnquiry,
    getAllEnquiries,
    updateEnquiry,
    deleteEnquiry
};
