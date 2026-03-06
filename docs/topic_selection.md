# Temat: System rezerwacji boisk i obiektów sportowych

## 1. Opis wybranego tematu
Aplikacja webowa pozwalająca na przeglądanie dostępności i rezerwację lokalnych obiektów sportowych w wybranych przedziałach czasowych.

## 2. Cel projektu
Cyfryzacja i automatyzacja procesu wynajmu boisk z wdrożeniem bezpiecznego logowania oraz podziałem uprawnień.

## 3. Zakres funkcjonalny
* **Autoryzacja:** Rejestracja i logowanie użytkowników (JWT/OAuth).
* **Role:** Użytkownik (klient) i Administrator (zarządca obiektu).
* **Użytkownik:** Przeglądanie listy boisk, sprawdzanie dostępnych terminów, tworzenie i anulowanie własnych rezerwacji.
* **Administrator:** Dodawanie, edycja i usuwanie boisk (CRUD), ustalanie godzin otwarcia oraz przegląd i zarządzanie wszystkimi rezerwacjami.

## 4. Proponowane technologie
* **Frontend:**  React.js.
* **Backend:** Node.js z Express.
* **Baza danych:** MongoDB.