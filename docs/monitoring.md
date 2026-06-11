# Monitoring aplikacji — konfiguracja i dokumentacja

## 1. Przegląd podejścia

Aplikacja korzysta z **własnego systemu logowania** opartego na plikach
(ang. *file-based logging*). Rozwiązanie to nie wymaga żadnych zewnętrznych
zależności i działa w każdym środowisku — lokalnym, stagingowym i produkcyjnym.

> **Alternatywne narzędzia** (Sentry, Datadog, UptimeRobot) opisane są w
> sekcji [6. Integracja z narzędziami zewnętrznymi](#6-integracja-z-narzędziami-zewnętrznymi).

---

## 2. Architektura monitoringu

```
backend/
├── middleware/
│   └── appLogger.js      # Access log każdego żądania HTTP
├── logs/                 # Generowane automatycznie przez serwer
│   ├── access.log        # Wszystkie żądania HTTP
│   └── .gitkeep          # Śledzi katalog w git (pusty)
└── server.js             # Montuje middleware appLogger
```

---

## 3. Pliki logów

### 3.1 `backend/logs/access.log` — Access log

Każde żądanie HTTP rejestrowane jest jako **jedna linia JSON**.

**Format wpisu:**

```json
{
  "timestamp":      "2025-03-05T14:00:00.000Z",
  "method":         "GET",
  "url":            "/api/facilities",
  "statusCode":     200,
  "responseTimeMs": 12.543,
  "ip":             "::1",
  "userAgent":      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ..."
}
```

| Pole             | Opis                                               |
|------------------|----------------------------------------------------|
| `timestamp`      | Czas odpowiedzi serwera (ISO 8601, UTC)            |
| `method`         | Metoda HTTP (`GET`, `POST`, `PUT`, `DELETE`)       |
| `url`            | Ścieżka i parametry query (`/api/auth?…`)          |
| `statusCode`     | Kod HTTP odpowiedzi                                |
| `responseTimeMs` | Czas obsługi żądania w milisekundach (3 miejsca)   |
| `ip`             | Adres IP klienta                                   |
| `userAgent`      | Nagłówek `User-Agent` przesłany przez klienta      |

---

## 4. Middleware — szczegóły implementacji

### `backend/middleware/appLogger.js`

- Montowany **przed trasami API** w `server.js`.
- Używa `process.hrtime.bigint()` do pomiaru czasu z rozdzielczością nanosekundową.
- Nadpisuje metodę `res.end()` — przechwytuje moment faktycznego wysłania odpowiedzi.
- Zapis do pliku jest **asynchroniczny** (`fs.appendFile`) — nie blokuje pętli zdarzeń.
- Błędy zapisu trafiają wyłącznie na `stderr`; nie przerywają obsługi żądania.

```javascript
// Fragment server.js
const appLogger = require('./middleware/appLogger');
app.use(appLogger); // przed trasami
```

---

## 5. Rotacja logów

Pliki logów rosną z czasem. Zalecane metody rotacji:

### Linux / macOS — `logrotate`

Utwórz plik `/etc/logrotate.d/taw-app`:

```
/path/to/backend/logs/*.log {
    daily
    rotate 30
    compress
    missingok
    notifempty
    sharedscripts
    postrotate
        # Node.js automatycznie otworzy nowy plik przy kolejnym zapisie
    endscript
}
```

### Windows — Task Scheduler

Utwórz zadanie harmonogramu uruchamiające skrypt PowerShell:

```powershell
# rotate-logs.ps1
$logDir = "C:\path\to\backend\logs"
$date   = Get-Date -Format "yyyyMMdd"

Get-ChildItem "$logDir\*.log" | ForEach-Object {
    $archive = "$logDir\$($_.BaseName)_$date.log"
    Move-Item $_.FullName $archive
    Compress-Archive $archive "$archive.zip"
    Remove-Item $archive
}
```

### Alternatywa — biblioteka `winston` z `DailyRotateFile`

```bash
npm install winston winston-daily-rotate-file
```

```javascript
const { createLogger, format, transports } = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

const logger = createLogger({
    format: format.json(),
    transports: [
        new DailyRotateFile({
            filename: 'logs/access-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxFiles: '30d',
        }),
    ],
});
```

---

## 6. Integracja z narzędziami zewnętrznymi

### 6.1 Sentry (śledzenie błędów)

Sentry umożliwia zbieranie i analizę błędów w czasie rzeczywistym,
z powiadomieniami e-mail / Slack.

```bash
npm install @sentry/node
```

```javascript
// server.js
const Sentry = require('@sentry/node');

Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 1.0,
});

app.use(Sentry.Handlers.requestHandler());
// ... trasy ...
app.use(Sentry.Handlers.errorHandler());
```

Wymagana zmienna środowiskowa:
```
SENTRY_DSN=https://<klucz>@o<id>.ingest.sentry.io/<project-id>
```

### 6.2 Datadog APM (śledzenie wydajności)

```bash
npm install dd-trace
```

```javascript
// Musi być pierwsza linia server.js
require('dd-trace').init({
    service: 'taw-backend',
    env: process.env.NODE_ENV,
});
```

Wymagana konfiguracja agenta Datadog na serwerze (plik `datadog.yaml`).

### 6.3 UptimeRobot (dostępność usługi)

1. Zaloguj się na [uptimerobot.com](https://uptimerobot.com).
2. Dodaj nowy monitor typu **HTTP(s)**.
3. Ustaw URL: `https://twoja-domena.pl/api/facilities`.
4. Ustaw interwał sprawdzania: **5 minut**.
5. Dodaj powiadomienie e-mail lub webhook.

> UptimeRobot nie wymaga zmian w kodzie aplikacji.

### 6.4 Prometheus + Grafana (metryki)

```bash
npm install prom-client
```

```javascript
const promClient = require('prom-client');
const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics({ timeout: 5000 });

// Endpoint /metrics (zabezpiecz przed dostępem publicznym!)
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', promClient.register.contentType);
    res.end(await promClient.register.metrics());
});
```

Konfiguracja `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'taw-backend'
    static_configs:
      - targets: ['localhost:5000']
    metrics_path: '/metrics'
    scrape_interval: 15s
```

---

## 7. Zmienne środowiskowe

Dodaj do pliku `.env` (nie commituj do repozytorium):

```env
# Sentry (opcjonalne)
SENTRY_DSN=

# Datadog (opcjonalne)
DD_AGENT_HOST=localhost
DD_TRACE_AGENT_PORT=8126
```

---

## 8. Sprawdzanie logów — szybka pomoc

```bash
# Ostatnie 50 wpisów access log
tail -n 50 backend/logs/access.log

# Żądania z błędami HTTP >= 400
grep '"statusCode":[45]' backend/logs/access.log | jq .

# Wolne żądania (> 500 ms)
cat backend/logs/access.log | jq 'select(.responseTimeMs > 500)'

# Liczba żądań per endpoint (last 1000 lines)
tail -n 1000 backend/logs/access.log | jq -r '.url' | sort | uniq -c | sort -rn
```
