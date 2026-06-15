const express = require('express');
const router = express.Router();
const Facility = require('../models/Facility');
const { protect, adminOnly } = require('../middleware/authMiddleware');

/**
 * GET /api/facilities
 * Zwraca listę wszystkich aktywnych obiektów sportowych.
 */
router.get('/', async (req, res) => {
    try {
        let query = { is_active: true };

        if (req.query.all === 'true') {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                const token = authHeader.split(' ')[1];
                const jwt = require('jsonwebtoken');
                try {
                    const decoded = jwt.verify(token, process.env.JWT_SECRET);
                    if (decoded && decoded.role === 'admin') {
                        query = {};
                    }
                } catch (err) {
                    // Ignoruj błędy tokenu, domyślnie tylko aktywne obiekty
                }
            }
        }

        const facilities = await Facility.find(query);
        res.json(facilities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * POST /api/facilities
 * Tworzy nowy obiekt sportowy (tylko dla administratora).
 */
router.post('/', protect, adminOnly, async (req, res) => {
    try {
        const { name, description, address, price_per_hour } = req.body;
        const newFacility = await Facility.create({ name, description, address, price_per_hour });
        res.status(201).json(newFacility);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * PUT /api/facilities/:id
 * Aktualizuje obiekt sportowy po ID (tylko dla administratora).
 */
router.put('/:id', protect, adminOnly, async (req, res) => {
    try {
        const updatedFacility = await Facility.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedFacility) {
            return res.status(404).json({ message: 'Nie znaleziono obiektu do edycji' });
        }
        res.json(updatedFacility);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * DELETE /api/facilities/:id
 * Usuwa obiekt sportowy po ID (tylko dla administratora).
 */
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        const deletedFacility = await Facility.findByIdAndDelete(req.params.id);
        if (!deletedFacility) {
            return res.status(404).json({ message: 'Nie znaleziono obiektu do usunięcia' });
        }
        res.json({ message: 'Obiekt został pomyślnie usunięty' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;