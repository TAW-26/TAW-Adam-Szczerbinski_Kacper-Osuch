// Importowanie wymaganych modułów
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Inicjalizacja aplikacji Express
const app = express();

// Middlewares
app.use(cors()); 
app.use(express.json()); 


app.get('/', (req, res) => {
  res.send('API Systemu Rezerwacji Boisk działa! ⚽');
});

// Konfiguracja portu
const PORT = process.env.PORT || 5000;

// Połączenie z bazą MongoDB i start serwera
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Połączono z bazą danych MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Serwer śmiga na porcie ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Błąd połączenia z bazą MongoDB:', err.message);
  });