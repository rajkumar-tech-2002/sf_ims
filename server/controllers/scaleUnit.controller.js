const ScaleUnit = require('../models/scaleUnit.model');

const getAllUnits = async (req, res) => {
    try {
        const units = await ScaleUnit.getAll();
        res.json(units);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching scale units', error: error.message });
    }
};

const createUnit = async (req, res) => {
    const { unit_name } = req.body;

    if (!unit_name) {
        return res.status(400).json({ message: 'Unit name is required' });
    }

    try {
        const existing = await ScaleUnit.getByName(unit_name);
        if (existing) {
            return res.status(400).json({ message: `Unit "${unit_name}" already exists. Please select it.` });
        }

        const id = await ScaleUnit.create(unit_name);
        res.status(201).json({ id, unit_name, message: 'Unit added successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error creating scale unit', error: error.message });
    }
};

module.exports = {
    getAllUnits,
    createUnit
};
