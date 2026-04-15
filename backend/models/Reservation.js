const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    facility_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility', required: true },
    start_time: { type: Date, required: true },
    end_time: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

module.exports = mongoose.model('Reservation', reservationSchema);