const express = require('express');
const router = express.Router();
const Facility = require('../models/Facility');
const { protect, adminOnly } = require('../middleware/authMiddleware');


router.get('/', async (req, res) => {
    try {
        const facilities = await Facility.find({ is_active: true });
        res.json(facilities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


router.post('/', protect, adminOnly, async (req, res) => {
    try {
        const { name, description, address, price_per_hour } = req.body;
        const facility = await Facility.create({
            name, description, address, price_per_hour
        });
        res.status(201).json(facility);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


router.put('/:id', protect, adminOnly, async (req, res) => {
    try {
        const facility = await Facility.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!facility) return res.status(404).json({ message: 'Nie znaleziono obiektu do edycji' });
        res.json(facility);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        const facility = await Facility.findByIdAndDelete(req.params.id);
        if (!facility) return res.status(404).json({ message: 'Nie znaleziono obiektu do usunięcia' });
        res.json({ message: 'Obiekt został pomyślnie usunięty' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;