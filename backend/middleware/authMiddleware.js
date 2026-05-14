const jwt = require('jsonwebtoken');

/**
 * Middleware: protect
 * Weryfikuje token JWT w nagłówku Authorization.
 * Dołącza zdekodowane dane użytkownika do req.user.
 */
const protect = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Brak autoryzacji, brak tokenu' });
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decodedToken;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Nieprawidłowy token' });
    }
};

/**
 * Middleware: adminOnly
 * Zezwala na dalsze wykonanie tylko użytkownikom z rolą 'admin'.
 * Musi być użyty po middleware protect.
 */
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Brak uprawnień administratora' });
    }
};

module.exports = { protect, adminOnly };