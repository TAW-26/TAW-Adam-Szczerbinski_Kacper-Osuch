# Prezentacja Projektu — SportRez

Slajdy do prezentacji końcowej projektu **SportRez** (system rezerwacji boisk i obiektów sportowych).

---

## Slajd 1: Tytułowy
* **Tytuł**: SportRez
* **Podtytuł**: Interaktywny system rezerwacji obiektów sportowych
* **Autorzy**: Adam Szczerbiński, Kacper Osuch
* **Technologie**: React, Node.js, Express, MongoDB
* **Główny cel**: Cyfryzacja, automatyzacja i monitoring wynajmu lokalnych boisk sportowych.

---

## Slajd 2: Cel i Zakres Projektu
* **Problem**: Ręczna rezerwacja boisk (telefon, e-mail), brak przejrzystości wolnych terminów, ryzyko nakładania się terminów.
* **Rozwiązanie**: Dostęp do harmonogramu boisk online 24/7.
* **Zakres funkcjonalny**:
  * **Uwierzytelnianie i autoryzacja**: Bezpieczna rejestracja, logowanie (JWT) i podział ról (`user` / `admin`).
  * **Dla Klienta**: Przeglądanie szczegółów obiektów, cennika, sprawdzanie dostępności i rezerwowanie wolnych terminów oraz anulowanie własnych rezerwacji w panelu użytkownika.
  * **Dla Administratora**: Pełny CRUD obiektów sportowych (dodawanie, edycja, wyłączanie/aktywacja) oraz zarządzanie rezerwacjami (zatwierdzanie, anulowanie, usuwanie).

---

## Slajd 3: Architektura Systemu
System działa w klasycznej architekturze trójwarstwowej (MERN bez React Native):

```
┌────────────────────────────────────────────────────────┐
│                        FRONTEND                        │
│             React.js (React Router, Axios)             │
│        Uwierzytelnianie: Context API (AuthContext)     │
└───────────────────────────┬────────────────────────────┘
                            │ Zapytania HTTP (REST API)
                            ▼
┌────────────────────────────────────────────────────────┐
│                        BACKEND                         │
│               Node.js, Express REST Server             │
│        Middleware: Auth, AppLogger, ResponseTime       │
└───────────────────────────┬────────────────────────────┘
                            │ Mongoose ODM
                            ▼
┌────────────────────────────────────────────────────────┐
│                      BAZA DANYCH                       │
│                     MongoDB (Atlas)                    │
│             Kolekcje: Users, Facilities, Reservations  │
└────────────────────────────────────────────────────────┘
```

---

## Slajd 4: Monitoring i Logi (Własne Rozwiązanie)
Projekt kładzie duży nacisk na stabilność i monitorowanie działania:
* **Własny system logowania (File-based)**:
  * Brak zewnętrznych zależności SaaS.
  * `access.log` — rejestracja każdego żądania HTTP w formacie JSON z czasem odpowiedzi w milisekundach.
  * `errors.log` — logowanie błędów ze stack-trace (poza produkcją).
* **Interaktywny Dashboard Logów (`/logs`)**:
  * Wizualizacja access logu w czasie rzeczywistym.
  * Statystyki (suma żądań, błędy 4xx/5xx, średni czas odpowiedzi, wolne żądania > 500 ms).
  * Filtrowanie i automatyczne odświeżanie (co 4 sekundy).

---

## Slajd 5: Napotkane Wyzwania i Rozwiązania
1. **Wyzwanie: Konflikty rezerwacji (nakładanie się terminów)**
   * *Rozwiązanie*: Implementacja walidacji w bazie MongoDB przy użyciu zapytania logicznego:
     `start_time < new_end_time && end_time > new_start_time`.
2. **Wyzwanie: Bezpieczne anulowanie rezerwacji**
   * *Rozwiązanie*: Zaimplementowanie w `/api/reservations/:id` dynamicznej weryfikacji tożsamości. Użytkownik może anulować tylko swoje rezerwacje, natomiast administrator ma pełną władzę nad wszystkimi rekordami.
3. **Wyzwanie: Wydajność i pomiar czasu**
   * *Rozwiązanie*: Użycie `process.hrtime.bigint()` w middleware do precyzyjnego pomiaru czasu odpowiedzi serwera z nanosekundową rozdzielczością.

---

## Slajd 6: Podsumowanie i Demonstracja Live
* **Stan projektu**: Gotowy do wdrożenia (wersja produkcyjna).
* **Pojedyncza linia komend do czyszczenia bazy**: `node clean_db.js` (usuwa testowe wpisy, tworzy konto admina `jan.kowalski@test.pl` z hasłem `mojetajnehaslo` oraz 3 główne obiekty).
* **Plan demonstracji live**:
  1. Rejestracja nowego użytkownika i logowanie.
  2. Rezerwacja obiektu "Orlik Centrum".
  3. Próba rezerwacji tego samego terminu (blokada / walidacja).
  4. Logowanie na konto admina i zatwierdzenie/anulowanie rezerwacji.
  5. Wizyta na `/logs` w celu weryfikacji wygenerowanych logów wydajnościowych.
