const fs = require('fs');
const path = require('path');

// Upewnij się, że katalog logs istnieje
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

const errorLogPath = path.join(logsDir, 'errors.log');

/**
 * Middleware: errorLogger
 * Globalny handler błędów Express.
 * Loguje każdy błąd do pliku logs/errors.log w formacie JSON (jeden obiekt na linię).
 *
 * Zapisywane pola:
 *   - timestamp  : czas wystąpienia błędu (ISO 8601)
 *   - errorType  : nazwa konstruktora błędu (np. ValidationError, CastError)
 *   - message    : treść komunikatu błędu
 *   - method     : metoda HTTP żądania (kontekst)
 *   - url        : ścieżka URL żądania (kontekst)
 *   - statusCode : kod HTTP zwrócony klientowi
 *   - stack      : pełny stack trace (tylko poza środowiskiem produkcyjnym)
 */
const errorLogger = (err, req, res, next) => {
    const statusCode = err.status || err.statusCode || 500;

    const logEntry = {
        timestamp: new Date().toISOString(),
        errorType: err.constructor?.name || 'Error',
        message: err.message || 'Nieznany błąd',
        method: req.method,
        url: req.originalUrl,
        statusCode,
    };

    // Stack trace tylko poza produkcją
    if (process.env.NODE_ENV !== 'production') {
        logEntry.stack = err.stack;
    }

    const logLine = JSON.stringify(logEntry) + '\n';

    // Zapisz do pliku (append)
    fs.appendFile(errorLogPath, logLine, (writeErr) => {
        if (writeErr) {
            console.error('[errorLogger] Nie udało się zapisać błędu do pliku:', writeErr.message);
        }
    });

    // Wypisz również na konsolę (czytelny format)
    console.error(
        `[ERROR] ${logEntry.timestamp} | ${logEntry.errorType} | ${req.method} ${req.originalUrl} | ${logEntry.message}`
    );

    // Odpowiedź dla klienta (nie ujawniaj stack trace)
    res.status(statusCode).json({
        error: {
            message: err.message || 'Wewnętrzny błąd serwera',
            type: logEntry.errorType,
        },
    });
};

module.exports = errorLogger;
