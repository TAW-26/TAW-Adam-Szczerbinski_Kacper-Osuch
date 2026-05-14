const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

/**
 * POST /api/auth/register
 * Rejestracja nowego użytkownika.
 * Sprawdza unikalność e-maila, haszuje hasło i zapisuje użytkownika.
 */
router.post('/register', async (req, res) => {
    try {
        const { first_name, last_name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Użytkownik już istnieje' });
        }

        const saltRounds = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const newUser = await User.create({ first_name, last_name, email, password_hash: passwordHash });
        res.status(201).json({ message: 'Użytkownik zarejestrowany', userId: newUser._id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/auth/login
 * Logowanie użytkownika.
 * Weryfikuje dane logowania i zwraca token JWT wraz z rolą.
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Nie znaleziono użytkownika' });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: 'Błędne hasło' });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );
        res.json({ token, role: user.role });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;