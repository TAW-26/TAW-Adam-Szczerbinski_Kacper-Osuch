require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Facility = require('./models/Facility');
const Reservation = require('./models/Reservation');

async function cleanAndSeed() {
    try {
        if (!process.env.MONGO_URI) {
            console.error('Brak zmiennej MONGO_URI w środowisku!');
            process.exit(1);
        }

        console.log('Łączenie z bazą danych...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Połączono z MongoDB.');

        // 1. Usunięcie wszystkich rezerwacji
        console.log('Usuwanie rezerwacji...');
        await Reservation.deleteMany({});
        console.log('Rezerwacje usunięte.');

        // 2. Usunięcie użytkowników z wyjątkiem głównego admina (upsert/update głównego admina)
        console.log('Czyszczenie tabeli użytkowników...');
        const passwordHash = await bcrypt.hash('mojetajnehaslo', 10);
        
        // Usuwamy wszystkich poza głównym adminem
        await User.deleteMany({ email: { $ne: 'jan.kowalski@test.pl' } });

        // Upsert admina
        await User.findOneAndUpdate(
            { email: 'jan.kowalski@test.pl' },
            {
                first_name: 'Jan',
                last_name: 'Kowalski',
                email: 'jan.kowalski@test.pl',
                password_hash: passwordHash,
                role: 'admin'
            },
            { upsert: true, new: true }
        );
        console.log('Użytkownicy wyczyszczeni, admin jan.kowalski@test.pl zaktualizowany.');

        // 3. Czyszczenie i ponowne zasiewanie obiektów sportowych
        console.log('Resetowanie obiektów sportowych...');
        await Facility.deleteMany({});

        const cleanFacilities = [
            {
                name: "Orlik Centrum",
                description: "Nowoczesne boisko ze sztuczną trawą i oświetleniem",
                address: "ul. Sportowa 1, Warszawa",
                price_per_hour: 150,
                is_active: true
            },
            {
                name: "Hala Widowiskowo-Sportowa",
                description: "Pełnowymiarowa hala do siatkówki i koszykówki z kompletnym wyposażeniem",
                address: "ul. Olimpijska 5, Gdańsk",
                price_per_hour: 200,
                is_active: true
            },
            {
                name: "Korty Tenisowe Park",
                description: "Dwa oświetlone korty o nawierzchni ceglanej",
                address: "ul. Parkowa 12, Wrocław",
                price_per_hour: 80,
                is_active: true
            }
        ];

        await Facility.insertMany(cleanFacilities);
        console.log('Obiekty sportowe zasiane pomyślnie.');

        console.log('Baza danych została wyczyszczona i zresetowana do stanu produkcyjnego!');
    } catch (error) {
        console.error('Błąd podczas czyszczenia bazy danych:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Rozłączono z MongoDB.');
    }
}

cleanAndSeed();
