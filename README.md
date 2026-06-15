# TAW-Adam-Szczerbinski_Kacper-Osuch

# System rezerwacji boisk i obiektów sportowych — SportRez

## 1. Opis wybranego tematu

Aplikacja webowa pozwalająca na przeglądanie dostępności i rezerwację lokalnych obiektów sportowych w wybranych przedziałach czasowych. Użytkownik może przeglądać listę boisk, sprawdzać szczegóły (adres, cena, opis) i składać rezerwacje online. Administrator zarządza obiektami i rezerwacjami przez dedykowany panel.

## 2. Cel projektu

Cyfryzacja i automatyzacja procesu wynajmu boisk z wdrożeniem bezpiecznego logowania oraz podziałem uprawnień na role użytkownika i administratora.

## 3. Zakres funkcjonalny — finalna implementacja

### Użytkownik (rola: `user`)
- Rejestracja i logowanie — tokeny JWT, hasła hashowane bcrypt (10 rund soli)
- Przeglądanie listy aktywnych boisk z wyszukiwarką (nazwa / adres)
- Szczegóły boiska — adres, opis, cena za godzinę
- Formularz rezerwacji — wybór daty i godziny, podgląd kosztu przed potwierdzeniem
- Panel użytkownika — historia rezerwacji z oznaczeniem statusu (oczekująca / potwierdzona / anulowana)
- Automatyczne wylogowanie po wygaśnięciu tokenu (1 dzień)

### Administrator (rola: `admin`)
- Wszystkie funkcje użytkownika
- CRUD obiektów sportowych (dodawanie, edycja, usuwanie) przez modal
- Podgląd wszystkich rezerwacji z danymi użytkownika
- Dashboard monitoringu logów HTTP — live, auto-odświeża co 4 sekundy (`/logs`)

### UI / ogólne
- Responsywny interfejs — mobile i desktop
- Stany: ładowania (skeleton/spinner), błędu (retry), braku danych (empty state)
- System powiadomień toast (sukces / błąd / info)

## 4. Technologie

- **Frontend:** React 19, React Router v7, Axios, CSS własny (dark mode, Google Fonts Inter)
- **Backend:** Node.js, Express 5, JWT (jsonwebtoken), bcryptjs
- **Baza danych:** MongoDB (Mongoose 9) — Atlas cloud
- **Testy:** Jest, Supertest — 8/8 testów
- **Monitoring:** Własny logger plikowy + dashboard HTML na `/logs`

---

## 5. Instrukcja uruchomienia

### Klonowanie repozytorium

    git clone https://github.com/TAW-26/TAW-Adam-Szczerbinski_Kacper-Osuch.git
    cd TAW-Adam-Szczerbinski_Kacper-Osuch

### Uruchomienie Backend (Node.js) — tryb developerski

    cd backend
    npm install
    cp .env.example .env   # uzupełnij MONGO_URI i JWT_SECRET
    npm run dev

Serwer dostępny na: http://localhost:5000

### Uruchomienie Frontend (React.js) — tryb developerski

    cd frontend
    npm install
    cp .env.example .env   # REACT_APP_API_URL=http://localhost:5000/api
    npm start

Aplikacja dostępna na: http://localhost:3000

### Uruchomienie produkcyjne

**Backend:**

    cd backend
    npm install --omit=dev
    NODE_ENV=production npm start

**Frontend — build produkcyjny:**

    cd frontend
    npm install
    npm run build

Folder `frontend/build/` zawiera gotową aplikację do wdrożenia na serwerze statycznym (np. Vercel, Netlify, nginx).

Opcjonalnie — serwowanie frontendu bezpośrednio przez Express (dodaj do `server.js`):

    const path = require('path');
    app.use(express.static(path.join(__dirname, '../frontend/build')));
    app.get('*', (req, res) =>
      res.sendFile(path.join(__dirname, '../frontend/build/index.html'))
    );

**Zmienne środowiskowe — produkcja:**

    PORT=5000
    MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/sports_facilities
    JWT_SECRET=<min. 32 losowe znaki>
    NODE_ENV=production

> Nigdy nie commituj pliku `.env` do repozytorium!

### Uruchomienie testów

    cd backend
    npm test

Wynik: 8/8 testów (auth.test.js + load.test.js)

### Czyszczenie danych testowych

    cd backend
    node clean_db.js

Usuwa dane testowe (użytkownicy testowi, powiązane rezerwacje).

---

## 6. Dokumentacja

Pełna dokumentacja w folderze `/docs`:
- `docs/api.md` — endpointy API z przykładami zapytań
- `docs/ui.md` — specyfikacja UI, design system, wireframes
- `docs/monitoring.md` — opis systemu logowania i dashboardu
- `docs/ERD.png` — diagram encji bazy danych
- `docs/use-cases.png` — diagram przypadków użycia

https://github.com/TAW-26/TAW-Adam-Szczerbinski_Kacper-Osuch/tree/main/docs

### Endpointy API (skrót)

    POST   /api/auth/register       rejestracja użytkownika
    POST   /api/auth/login          logowanie -> { token, role }

    GET    /api/facilities          lista boisk (publiczny)
    POST   /api/facilities          dodaj boisko [admin]
    PUT    /api/facilities/:id      edytuj boisko [admin]
    DELETE /api/facilities/:id      usuń boisko [admin]

    POST   /api/reservations        stwórz rezerwację [user]
    GET    /api/reservations/my     moje rezerwacje [user]
    GET    /api/reservations        wszystkie rezerwacje [admin]
    PUT    /api/reservations/:id    aktualizuj rezerwację [admin]
    DELETE /api/reservations/:id    usuń rezerwację [admin]

    GET    /logs                    dashboard logów (HTML)

Autoryzacja: nagłówek `Authorization: Bearer <token>`

---

## 7. Znane ograniczenia

| Ograniczenie | Szczegóły |
|---|---|
| Brak `GET /api/facilities/:id` | Frontend pobiera całą listę i filtruje po ID — nieoptymalne przy dużej liczbie boisk |
| Dashboard `/logs` bez auth | Endpoint logów jest publiczny — należy zabezpieczyć przed produkcją |
| Brak sprawdzania kolizji rezerwacji | System nie weryfikuje czy boisko jest już zajęte w danym terminie |
| Brak paginacji | API zwraca wszystkie rekordy naraz |
| Brak refresh tokenu | Token JWT ważny 1 dzień, brak mechanizmu odnowienia bez ponownego logowania |
| CORS otwarty | Backend akceptuje requesty z każdego originu |
| Anulowanie przez użytkownika | DELETE /reservations/:id wymaga roli admin — użytkownik nie może samodzielnie anulować przez API |

---

## 8. Autorzy

- **Adam Szczerbiński**
- **Kacper Osuch**

Projekt zrealizowany w ramach przedmiotu **Technologie Aplikacji Webowych (TAW)**, 2025/2026.
