require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');


connectDB();

const app = express();


app.use(cors());
app.use(express.json());


app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/facilities', require('./routes/facilityRoutes')); 
app.use('/api/reservations', require('./routes/reservationRoutes')); 

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serwer działa na porcie ${PORT}`));