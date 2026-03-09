const Assets = require('../models/assets.model');

const AssetsController = {
    create: async (req, res) => {
        try {
            const assetId = await Assets.create(req.body);
            res.status(201).json({
                message: 'Asset saved successfully',
                id: assetId
            });
        } catch (error) {
            console.error('Error in AssetsController.create:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    findAll: async (req, res) => {
        try {
            const assets = await Assets.findAll();
            res.status(200).json(assets);
        } catch (error) {
            console.error('Error in AssetsController.findAll:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    findById: async (req, res) => {
        try {
            const asset = await Assets.findById(req.params.id);
            if (!asset) {
                return res.status(404).json({ message: 'Asset not found' });
            }
            res.status(200).json(asset);
        } catch (error) {
            console.error('Error in AssetsController.findById:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    update: async (req, res) => {
        try {
            const success = await Assets.update(req.params.id, req.body);
            if (success) {
                res.status(200).json({ message: 'Asset updated successfully' });
            } else {
                res.status(404).json({ message: 'Asset not found' });
            }
        } catch (error) {
            console.error('Error in AssetsController.update:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    delete: async (req, res) => {
        try {
            const success = await Assets.delete(req.params.id);
            if (success) {
                res.status(200).json({ message: 'Asset deleted successfully' });
            } else {
                res.status(404).json({ message: 'Asset not found' });
            }
        } catch (error) {
            console.error('Error in AssetsController.delete:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    getDistinctNames: async (req, res) => {
        try {
            const names = await Assets.getDistinctNames();
            res.status(200).json(names);
        } catch (error) {
            console.error('Error in AssetsController.getDistinctNames:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
};

module.exports = AssetsController;
