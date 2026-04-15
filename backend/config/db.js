const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Połączono z bazą MongoDB');
    } catch (error) {
        console.error('Błąd połączenia z bazą:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;