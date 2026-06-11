const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const logsDir = path.join(__dirname, '..', 'logs');
const accessLogPath = path.join(logsDir, 'access.log');

/**
 * GET /logs
 * Serwuje wizualny dashboard logów w przeglądarce.
 */
router.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>📊 Log Dashboard — TAW App</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:        #0d1117;
      --surface:   #161b22;
      --surface2:  #21262d;
      --border:    #30363d;
      --text:      #e6edf3;
      --muted:     #8b949e;
      --green:     #3fb950;
      --yellow:    #d29922;
      --red:       #f85149;
      --blue:      #58a6ff;
      --purple:    #bc8cff;
      --accent:    #238636;
    }

    body {
      font-family: 'Inter', sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      padding: 0 0 60px;
    }

    /* ── Header ── */
    header {
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      padding: 18px 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .logo { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 1.15rem; }
    .logo span { color: var(--blue); }
    .live-badge {
      display: flex; align-items: center; gap: 6px;
      background: rgba(63,185,80,.12); border: 1px solid rgba(63,185,80,.3);
      color: var(--green); padding: 4px 12px; border-radius: 20px; font-size: .78rem; font-weight: 600;
    }
    .live-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--green); animation: pulse 1.4s infinite; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }

    /* ── Layout ── */
    .container { max-width: 1400px; margin: 0 auto; padding: 28px 32px 0; }

    /* ── Stats cards ── */
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 28px; }
    .stat-card {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 10px; padding: 18px 20px;
      transition: border-color .2s;
    }
    .stat-card:hover { border-color: var(--blue); }
    .stat-label { font-size: .75rem; color: var(--muted); text-transform: uppercase; letter-spacing: .05em; margin-bottom: 8px; }
    .stat-value { font-size: 2rem; font-weight: 700; }
    .stat-value.green  { color: var(--green); }
    .stat-value.yellow { color: var(--yellow); }
    .stat-value.red    { color: var(--red); }
    .stat-value.blue   { color: var(--blue); }
    .stat-value.purple { color: var(--purple); }

    /* ── Toolbar ── */
    .toolbar {
      display: flex; align-items: center; gap: 12px;
      margin-bottom: 16px; flex-wrap: wrap;
    }
    .toolbar-title { font-weight: 600; font-size: 1rem; margin-right: auto; }
    input[type="text"] {
      background: var(--surface2); border: 1px solid var(--border);
      color: var(--text); padding: 7px 14px; border-radius: 6px;
      font-family: 'JetBrains Mono', monospace; font-size: .82rem;
      outline: none; width: 220px; transition: border-color .2s;
    }
    input[type="text"]:focus { border-color: var(--blue); }
    select {
      background: var(--surface2); border: 1px solid var(--border);
      color: var(--text); padding: 7px 12px; border-radius: 6px;
      font-family: 'Inter', sans-serif; font-size: .82rem; outline: none; cursor: pointer;
    }
    button {
      background: var(--accent); border: none; color: #fff;
      padding: 7px 16px; border-radius: 6px; font-size: .82rem;
      font-weight: 600; cursor: pointer; transition: opacity .2s;
    }
    button:hover { opacity: .85; }
    button.secondary { background: var(--surface2); border: 1px solid var(--border); color: var(--text); }

    /* ── Table ── */
    .table-wrap { overflow-x: auto; border-radius: 10px; border: 1px solid var(--border); }
    table { width: 100%; border-collapse: collapse; font-size: .84rem; }
    thead th {
      background: var(--surface2); padding: 11px 16px;
      text-align: left; color: var(--muted); font-weight: 600;
      font-size: .75rem; text-transform: uppercase; letter-spacing: .05em;
      border-bottom: 1px solid var(--border); white-space: nowrap;
    }
    tbody tr { border-bottom: 1px solid var(--border); transition: background .15s; }
    tbody tr:last-child { border-bottom: none; }
    tbody tr:hover { background: var(--surface2); }
    tbody td { padding: 10px 16px; vertical-align: middle; white-space: nowrap; }

    /* Method badges */
    .badge {
      display: inline-block; padding: 2px 9px; border-radius: 4px;
      font-family: 'JetBrains Mono', monospace; font-size: .75rem; font-weight: 600;
    }
    .GET    { background: rgba(88,166,255,.15); color: var(--blue); }
    .POST   { background: rgba(63,185,80,.15);  color: var(--green); }
    .PUT    { background: rgba(210,153,34,.15); color: var(--yellow); }
    .DELETE { background: rgba(248,81,73,.15);  color: var(--red); }
    .PATCH  { background: rgba(188,140,255,.15);color: var(--purple); }

    /* Status codes */
    .s2 { color: var(--green); font-weight: 600; }
    .s3 { color: var(--blue);  font-weight: 600; }
    .s4 { color: var(--yellow);font-weight: 600; }
    .s5 { color: var(--red);   font-weight: 600; }

    .url-cell { font-family: 'JetBrains Mono', monospace; font-size: .79rem; max-width: 300px; overflow: hidden; text-overflow: ellipsis; }
    .time-cell { font-family: 'JetBrains Mono', monospace; font-size: .79rem; }
    .ts-cell   { color: var(--muted); font-size: .78rem; }
    .slow-tag  { font-size: .7rem; background: rgba(248,81,73,.15); color: var(--red); padding: 1px 6px; border-radius: 4px; margin-left: 6px; }

    .empty { text-align: center; padding: 60px; color: var(--muted); }
    #last-updated { font-size: .75rem; color: var(--muted); }

    /* Scrollbar */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: var(--bg); }
    ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
  </style>
</head>
<body>

<header>
  <div class="logo">📊 <span>TAW</span> Log Dashboard</div>
  <div style="display:flex;align-items:center;gap:14px">
    <span id="last-updated">—</span>
    <div class="live-badge"><div class="live-dot"></div> LIVE</div>
  </div>
</header>

<div class="container">

  <!-- Stats -->
  <div class="stats" id="stats">
    <div class="stat-card"><div class="stat-label">Wszystkie żądania</div><div class="stat-value blue" id="s-total">—</div></div>
    <div class="stat-card"><div class="stat-label">2xx Sukces</div><div class="stat-value green" id="s-2xx">—</div></div>
    <div class="stat-card"><div class="stat-label">4xx Błąd klienta</div><div class="stat-value yellow" id="s-4xx">—</div></div>
    <div class="stat-card"><div class="stat-label">5xx Błąd serwera</div><div class="stat-value red" id="s-5xx">—</div></div>
    <div class="stat-card"><div class="stat-label">Śr. czas odpowiedzi</div><div class="stat-value purple" id="s-avg">—</div></div>
    <div class="stat-card"><div class="stat-label">Wolne żądania (&gt;500ms)</div><div class="stat-value red" id="s-slow">—</div></div>
  </div>

  <!-- Toolbar -->
  <div class="toolbar">
    <span class="toolbar-title">📋 Access Log</span>
    <input type="text" id="filter" placeholder="Filtruj URL lub metodę…" oninput="renderTable()" />
    <select id="status-filter" onchange="renderTable()">
      <option value="">Wszystkie kody</option>
      <option value="2">2xx</option>
      <option value="3">3xx</option>
      <option value="4">4xx</option>
      <option value="5">5xx</option>
    </select>
    <button class="secondary" onclick="fetchLogs()">🔄 Odśwież</button>
  </div>

  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Czas</th>
          <th>Metoda</th>
          <th>URL</th>
          <th>Status</th>
          <th>Czas odp.</th>
          <th>IP</th>
        </tr>
      </thead>
      <tbody id="log-body"><tr><td colspan="7" class="empty">Ładowanie logów…</td></tr></tbody>
    </table>
  </div>
</div>

<script>
  let allLogs = [];

  async function fetchLogs() {
    try {
      const res = await fetch('/api/logs/access');
      allLogs = await res.json();
      updateStats(allLogs);
      renderTable();
      document.getElementById('last-updated').textContent =
        'Aktualizacja: ' + new Date().toLocaleTimeString('pl-PL');
    } catch(e) {
      console.error(e);
    }
  }

  function updateStats(logs) {
    const total = logs.length;
    const s2 = logs.filter(l => l.statusCode >= 200 && l.statusCode < 300).length;
    const s4 = logs.filter(l => l.statusCode >= 400 && l.statusCode < 500).length;
    const s5 = logs.filter(l => l.statusCode >= 500).length;
    const slow = logs.filter(l => l.responseTimeMs > 500).length;
    const avgMs = total > 0
      ? (logs.reduce((a,l) => a + l.responseTimeMs, 0) / total).toFixed(1)
      : '—';

    document.getElementById('s-total').textContent = total;
    document.getElementById('s-2xx').textContent   = s2;
    document.getElementById('s-4xx').textContent   = s4;
    document.getElementById('s-5xx').textContent   = s5;
    document.getElementById('s-avg').textContent   = total > 0 ? avgMs + ' ms' : '—';
    document.getElementById('s-slow').textContent  = slow;
  }

  function renderTable() {
    const filterText = document.getElementById('filter').value.toLowerCase();
    const statusFilter = document.getElementById('status-filter').value;

    const filtered = allLogs.filter(l => {
      const matchText = !filterText ||
        l.url.toLowerCase().includes(filterText) ||
        l.method.toLowerCase().includes(filterText);
      const matchStatus = !statusFilter || String(l.statusCode).startsWith(statusFilter);
      return matchText && matchStatus;
    });

    const tbody = document.getElementById('log-body');
    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="empty">Brak wpisów pasujących do filtru.</td></tr>';
      return;
    }

    const rows = [...filtered].reverse().map((l, i) => {
      const sc = l.statusCode;
      const cls = sc >= 500 ? 's5' : sc >= 400 ? 's4' : sc >= 300 ? 's3' : 's2';
      const method = l.method || 'GET';
      const isSlow = l.responseTimeMs > 500;
      const ts = new Date(l.timestamp).toLocaleString('pl-PL');

      return \`<tr>
        <td style="color:var(--muted);font-size:.77rem">\${filtered.length - i}</td>
        <td class="ts-cell">\${ts}</td>
        <td><span class="badge \${method}">\${method}</span></td>
        <td class="url-cell" title="\${l.url}">\${l.url}</td>
        <td class="\${cls}">\${sc}</td>
        <td class="time-cell">\${l.responseTimeMs} ms\${isSlow ? '<span class="slow-tag">SLOW</span>' : ''}</td>
        <td style="color:var(--muted);font-size:.78rem">\${l.ip || '-'}</td>
      </tr>\`;
    }).join('');

    tbody.innerHTML = rows;
  }

  // Auto-refresh every 4 seconds
  fetchLogs();
  setInterval(fetchLogs, 4000);
</script>
</body>
</html>`);
});

/**
 * GET /api/logs/access
 * Zwraca sparsowane wpisy z access.log jako JSON.
 */
router.get('/access', (req, res) => {
    if (!fs.existsSync(accessLogPath)) {
        return res.json([]);
    }
    const raw = fs.readFileSync(accessLogPath, 'utf-8');
    const lines = raw.trim().split('\n').filter(Boolean);
    const entries = lines.map(line => {
        try { return JSON.parse(line); } catch { return null; }
    }).filter(Boolean);
    res.json(entries);
});

module.exports = router;
