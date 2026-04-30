const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const { protect, adminOnly } = require('../middleware/authMiddleware');


router.post('/', protect, async (req, res) => {
    try {
        const { facility_id, start_time, end_time } = req.body;
        
       
        if (!facility_id || !start_time || !end_time) {
            return res.status(400).json({ message: 'Proszę podać wszystkie dane' });
        }

        const reservation = await Reservation.create({
            user_id: req.user.id,
            facility_id,
            start_time,
            end_time
        });

        res.status(201).json(reservation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/my', protect, async (req, res) => {
    try {
        const reservations = await Reservation.find({ user_id: req.user.id }).populate('facility_id', 'name address');
        res.json(reservations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


router.get('/', protect, adminOnly, async (req, res) => {
    try {
        const reservations = await Reservation.find()
            .populate('user_id', 'first_name last_name email')
            .populate('facility_id', 'name');
        res.json(reservations);
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