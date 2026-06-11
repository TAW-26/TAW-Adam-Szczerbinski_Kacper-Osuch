const fs = require('fs');
const path = require('path');

// Upewnij się, że katalog logs istnieje
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

const accessLogPath = path.join(logsDir, 'access.log');

/**
 * Middleware: appLogger
 * Rejestruje każde przychodzące żądanie HTTP (access log).
 *
 * Format wpisu (JSON, jedna linia na żądanie):
 *   {
 *     "timestamp"      : "2025-03-05T14:00:00.000Z",
 *     "method"         : "GET",
 *     "url"            : "/api/facilities",
 *     "statusCode"     : 200,
 *     "responseTimeMs" : 12.543,
 *     "ip"             : "::1",
 *     "userAgent"      : "Mozilla/5.0 ..."
 *   }
 *
 * Logi trafiają do:
 *   backend/logs/access.log  (append, rotacja ręczna lub narzędzie zewnętrzne)
 *
 * Błędy zapisu do pliku są raportowane wyłącznie na stderr — nie przerywają
 * obsługi żądania.
 */
const appLogger = (req, res, next) => {
    const startAt = process.hrtime.bigint();

    // Przechwytujemy moment zakończenia odpowiedzi
    const originalEnd = res.end.bind(res);

    res.end = (...args) => {
        const durationNs  = process.hrtime.bigint() - startAt;
        const durationMs  = parseFloat((Number(durationNs) / 1_000_000).toFixed(3));

        const logEntry = {
            timestamp:      new Date().toISOString(),
            method:         req.method,
            url:            req.originalUrl,
            statusCode:     res.statusCode,
            responseTimeMs: durationMs,
            ip:             req.ip || req.socket?.remoteAddress || '-',
            userAgent:      req.get('User-Agent') || '-',
        };

        const logLine = JSON.stringify(logEntry) + '\n';

        fs.appendFile(accessLogPath, logLine, (writeErr) => {
            if (writeErr) {
                console.error('[appLogger] Nie udało się zapisać wpisu dostępu:', writeErr.message);
            }
        });

        // Wypisz na stdout skrócony format czytelny dla człowieka
        console.log(
            `[${logEntry.timestamp}] ${logEntry.method} ${logEntry.url} ${logEntry.statusCode} ${durationMs}ms`
        );

        return originalEnd(...args);
    };

    next();
};

module.exports = appLogger;
