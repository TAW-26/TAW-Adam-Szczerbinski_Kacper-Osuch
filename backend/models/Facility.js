const mongoose = require('mongoose');

const facilitySchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    address: { type: String, required: true },
    price_per_hour: { type: Number, required: true },
    is_active: { type: Boolean, default: true }
});

module.exports = mongoose.model('Facility', facilitySchema);