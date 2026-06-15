const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const { protect, adminOnly } = require('../middleware/authMiddleware');

/**
 * POST /api/reservations
 * Tworzy nową rezerwację dla zalogowanego użytkownika.
 */
router.post('/', protect, async (req, res) => {
    try {
        const { facility_id, start_time, end_time } = req.body;

        if (!facility_id || !start_time || !end_time) {
            return res.status(400).json({ message: 'Proszę podać wszystkie dane' });
        }

        const start = new Date(start_time);
        const end = new Date(end_time);

        if (start >= end) {
            return res.status(400).json({ message: 'Godzina zakończenia musi być późniejsza niż rozpoczęcia.' });
        }

        // Sprawdź nakładanie się rezerwacji
        const overlappingReservation = await Reservation.findOne({
            facility_id,
            status: { $ne: 'cancelled' },
            start_time: { $lt: end },
            end_time: { $gt: start }
        });

        if (overlappingReservation) {
            return res.status(400).json({ message: 'Ten termin jest już zarezerwowany.' });
        }

        const reservation = await Reservation.create({
            user_id: req.user.id,
            facility_id,
            start_time,
            end_time,
        });

        res.status(201).json(reservation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * GET /api/reservations/my
 * Zwraca listę rezerwacji zalogowanego użytkownika.
 */
router.get('/my', protect, async (req, res) => {
    try {
        const reservations = await Reservation.find({ user_id: req.user.id })
            .populate('facility_id', 'name address');
        res.json(reservations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * GET /api/reservations
 * Zwraca wszystkie rezerwacje (tylko dla administratora).
 */
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

/**
 * PUT /api/reservations/:id
 * Aktualizuje rezerwację po ID (tylko dla administratora).
 */
router.put('/:id', protect, adminOnly, async (req, res) => {
    try {
        const updatedReservation = await Reservation.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedReservation) {
            return res.status(404).json({ message: 'Nie znaleziono rezerwacji do edycji' });
        }
        res.json(updatedReservation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * DELETE /api/reservations/:id
 * Usuwa rezerwację po ID (tylko dla administratora).
 */
router.delete('/:id', protect, async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        if (!reservation) {
            return res.status(404).json({ message: 'Nie znaleziono rezerwacji do usunięcia' });
        }

        // Zezwalaj tylko adminowi lub właścicielowi rezerwacji
        if (req.user.role !== 'admin' && reservation.user_id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Brak uprawnień do anulowania tej rezerwacji' });
        }

        await Reservation.findByIdAndDelete(req.params.id);
        res.json({ message: 'Rezerwacja została pomyślnie usunięta' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;