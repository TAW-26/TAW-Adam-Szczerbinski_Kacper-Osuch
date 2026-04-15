# Dokumentacja API - System rezerwacji boisk i obiektów sportowych

Poniżej znajdują się przykłady zapytań do naszego API. Plik jest przystosowany do użycia z rozszerzeniem **REST Client** w VS Code. Zawiera automatyczne pobieranie tokenu po zalogowaniu, więc nie ma potrzeby ręcznego kopiowania nagłówka `Authorization`.

```http
@baseUrl = http://localhost:5000/api

### 1. Rejestracja nowego użytkownika
POST {{baseUrl}}/auth/register
Content-Type: application/json

{
    "first_name": "Jan",
    "last_name": "Kowalski",
    "email": "jan.kowalski@test.pl",
    "password": "mojetajnehaslo"
}

### 2. Logowanie użytkownika
# @name login
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
    "email": "jan.kowalski@test.pl",
    "password": "mojetajnehaslo"
}



@token = {{login.response.body.token}}


### 3. Pobierz listę boisk
GET {{baseUrl}}/facilities

### 4. Dodaj nowe boisko
# @name createFacility
POST {{baseUrl}}/facilities
Content-Type: application/json
Authorization: Bearer {{token}}

{
    "name": "Orlik Centrum",
    "description": "Nowoczesne boisko ze sztuczną trawą i oświetleniem",
    "address": "ul. Sportowa 1, Warszawa",
    "price_per_hour": 150
}


# Wyciągamy ID nowo utworzonego boiska
@facilityId = {{createFacility.response.body._id}}


### 5. Edytuj boisko 
PUT {{baseUrl}}/facilities/{{facilityId}}
Content-Type: application/json
Authorization: Bearer {{token}}

{
    "price_per_hour": 180
}

### 6. Usuń boisko 
# Odkomentuj poniższe linie, aby przetestować usuwanie
# DELETE {{baseUrl}}/facilities/{{facilityId}}
# Authorization: Bearer {{token}}

### 7. Zrób rezerwację
POST {{baseUrl}}/reservations
Content-Type: application/json
Authorization: Bearer {{token}}

{
    "facility_id": "{{facilityId}}", 
    "start_time": "2024-07-01T18:00:00Z",
    "end_time": "2024-07-01T19:30:00Z"
}

### 8. Pobierz moje rezerwacje 
GET {{baseUrl}}/reservations/my
Authorization: Bearer {{token}}

### 9. Pobierz wszystkie rezerwacje 
GET {{baseUrl}}/reservations
Authorization: Bearer {{token}}