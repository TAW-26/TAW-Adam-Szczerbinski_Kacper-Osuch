const fs = require('fs');
const path = require('path');

// Upewnij się, że katalog logs istnieje
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

const perfLogPath = path.join(logsDir, 'performance.log');

// Próg czasu odpowiedzi uznawany za "wolny" (ms)
const SLOW_REQUEST_THRESHOLD_MS = 500;

/**
 * Middleware: responseTime
 * Mierzy czas obsługi każdego żądania HTTP.
 *
 * - Dodaje nagłówek X-Response-Time (w ms) do każdej odpowiedzi.
 * - Loguje KAŻDE żądanie do pliku logs/performance.log (JSON, jedna linia na żądanie).
 * - Oznacza żądania przekraczające SLOW_REQUEST_THRESHOLD_MS jako wolne (slow: true).
 */
const responseTime = (req, res, next) => {
    const startAt = process.hrtime.bigint();

    // Nadpisanie res.end, żeby przechwycić moment wysłania odpowiedzi
    const originalEnd = res.end.bind(res);

    res.end = (...args) => {
        const durationNs = process.hrtime.bigint() - startAt;
        const durationMs = Number(durationNs) / 1_000_000;
        const durationFormatted = parseFloat(durationMs.toFixed(3));

        // Nagłówek X-Response-Time
        if (!res.headersSent) {
            res.setHeader('X-Response-Time', `${durationFormatted}ms`);
        }

        const isSlow = durationMs > SLOW_REQUEST_THRESHOLD_MS;

        const logEntry = {
            timestamp: new Date().toISOString(),
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            responseTimeMs: durationFormatted,
            slow: isSlow,
        };

        const logLine = JSON.stringify(logEntry) + '\n';

        fs.appendFile(perfLogPath, logLine, (writeErr) => {
            if (writeErr) {
                console.error('[responseTime] Nie udało się zapisać wpisu do pliku:', writeErr.message);
            }
        });

        if (isSlow) {
            console.warn(
                `[SLOW] ${logEntry.timestamp} | ${req.method} ${req.originalUrl} | ${durationFormatted} ms`
            );
        }

        return originalEnd(...args);
    };

    next();
};

module.exports = responseTime;
