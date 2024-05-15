# Backend projektuppgift del 1

av Saga Einarsdotter Kikajon

## Bakgrund

Projektuppgiften går ut på 2-3 delar; skapa en webbtjänst för att göra CRUD-operationer mot en databas, skapa ett användargränssnitt för sagda operationer, och skapa en webbplats som konsumerar webbtjänsten.

## Utveckling

Webbtjänsten är skapad med Express och använder sig av cors, jsonwebtoken och validator samt express-mongo-sanitizer. Som databas används MongoDB på Atlas, och paketet Mongoose utnyttjas för att strukturera data.
Till sist används dotenv och nodemon som dev dependencies.  
Mycket av funktionaliteten för användarregistrering, inloggning, felmeddelanden och dylikt har återvunnits från mina tidigare arbeten, framförallt https://github.com/sagaeinkik/api-cv2.
Använd `npm install` i terminalen för att hämta hem samtliga paket efter att git-repot har klonats ner lokalt.

## Användning

API:et är uppdelat i tre kollektioner. Det finns funktionalitet för att skapa och logga in användare, för att hantera produkter, och för att hantera användaromdömen. Följande endpoints används:

| Metod   |  Ändpunkt                     | Beskrivning                                           |
| ------- | ----------------------------- | ----------------------------------------------------- |
|  GET    | /products                     | Hämtar alla produkter                                 |
|  GET    |  /products/:id                |  Hämtar specifik produkt baserat på ID                |
|  GET    |  /products/product/:name      | Hämtar specifik produkt baserat på namn               |
|  GET    |  /products/category/:category |  Hämtar alla produkter i specifik kategori            |
| GET     |  /reviews                     | Hämtar alla omdömen                                   |
|  GET    |  /reviews/:id                 |  Hämtar specifikt omdöme baserat på ID                |
|  GET    |  /reviews/filter/unapproved   |  Hämtar alla omdömen med approved: false som egenskap |
|  GET    |  /reviews/filter/approved     | Hämtar alla omdömen med approved: true som egenskap   |
|  GET    |  /protected                   |  Nås endast med hjälp av giltig JWT                   |
| POST    |  /products                    |  Lägger till ny produkt                               |
|  POST   |  /reviews                     |  Lägger till nytt omdöme                              |
|  POST   |  /signup                      |  Skapar ny användare                                  |
|  POST   |  /login                       |  Loggar in användare                                  |
|  PUT    |  /products/:id                | Uppdaterar dokument med specifikt ID                  |
|  PUT    |  /reviews/:id                 |  Uppdaterar approved-nyckel med specifikt ID          |
| DELETE  |  /products/:id                |  Raderar produkt med specifikt ID                     |
|  DELETE | /reviews/:id                  |  Raderar omdöme med specifikt ID                      |

I `.env.sample`-filen finns de miljövariabler man behöver fylla i med sina egna;

```
JWT_SECRET_KEY=YOUR_SECRET_KEY
PORT=YOUR_PORT
DB_URL=YOUR_MONGODB_URL
```

JWT_SECRET_KEY kan genereras genom att köra kommandot `node generateSecret.js` och kopiera det resultat man får tillbaka i konsollen.

## Exempelanvändning

`GET url/reviews` ger resultat som kan se ut såhär:

```
[
  {
    "_id": "66452b73b280c4f7aff4d7e4",
    "fullName": "Loka",
    "email": "hey@mail.se",
    "rating": 4,
    "comment": "Mango",
    "posted": "2024-05-15T21:38:30.468Z",
    "approved": true,
    "__v": 0
  },
  {
    "_id": "6644f71d58c8dc94274d6a60",
    "fullName": "Mario",
    "email": "mario@mail.se",
    "rating": 5,
    "comment": "Enastående service",
    "posted": "2024-05-15T17:42:00.492Z",
    "approved": false,
    "__v": 0
  }
]
```
