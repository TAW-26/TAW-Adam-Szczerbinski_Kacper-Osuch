require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const responseTime = require('./middleware/responseTime');
const errorLogger = require('./middleware/errorLogger');

// Połączenie z bazą danych
connectDB();

const app = express();

// Middleware globalne
app.use(cors());
app.use(express.json());

// Monitorowanie czasu odpowiedzi (musi być przed trasami)
app.use(responseTime);

// Trasy API
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/facilities', require('./routes/facilityRoutes'));
app.use('/api/reservations', require('./routes/reservationRoutes'));

// Globalny handler błędów (musi być po trasach)
app.use(errorLogger);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serwer działa na porcie ${PORT}`));

module.exports = app;