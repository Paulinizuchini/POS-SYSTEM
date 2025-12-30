# POS System 101.1 - MOTO Transaktionssystem

Ein vollständiges Point-of-Sale System mit Protokoll 101.1 für MOTO (Mail Order/Telephone Order) Transaktionen.

## Features

- ✅ **MOTO Transaktionen** mit Protokoll 101.1
- ✅ **Manuelle Karteneingabe**: 16-stellige Kartennummer, Ablaufdatum, CVV, Kartenbesitzer
- ✅ **Approval Code**: Unterstützung für 4 oder 6-stellige Codes
- ✅ **API-Verwaltung**: Konfigurierbare API-URL und API-Key
- ✅ **Geräteverbindung**: Verbindung mit anderen POS-Geräten über API-URL (nicht im gleichen Netzwerk erforderlich)
- ✅ **Transaktionsverlauf**: Vollständige Historie aller Transaktionen
- ✅ **Moderne Benutzeroberfläche**: Intuitive und benutzerfreundliche UI

## Installation

### Backend

```bash
cd backend
npm install
npm start
```

Das Backend läuft standardmäßig auf Port 3001.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Das Frontend läuft standardmäßig auf Port 3000.

## Verwendung

1. **Backend starten**: Öffnen Sie ein Terminal im `backend` Ordner und führen Sie `npm start` aus
2. **Frontend starten**: Öffnen Sie ein weiteres Terminal im `frontend` Ordner und führen Sie `npm run dev` aus
3. **Browser öffnen**: Navigieren Sie zu `http://localhost:3000`

## Funktionen

### Transaktion durchführen

1. Navigieren Sie zum Tab "Transaktion"
2. Geben Sie alle erforderlichen Kartendaten ein:
   - 16-stellige Kartennummer
   - Ablaufdatum (MM/YY)
   - CVV (3-4 Stellen)
   - Kartenbesitzer
   - Betrag
   - Approval Code (4 oder 6 Stellen)
3. Klicken Sie auf "Transaktion durchführen"

### API konfigurieren

1. Navigieren Sie zum Tab "API Konfiguration"
2. Geben Sie die API-URL ein (z.B. `http://192.168.1.100:3001`)
3. Optional: Geben Sie einen API-Key ein
4. Klicken Sie auf "Konfiguration speichern"

### Gerät verbinden

1. Navigieren Sie zum Tab "Geräte"
2. Geben Sie die URL des anderen POS-Geräts ein
3. Optional: Geben Sie einen Gerätenamen ein
4. Klicken Sie auf "Gerät verbinden"

## Protokoll 101.1

Das System verwendet das Protokoll 101.1 für MOTO-Transaktionen. Alle Transaktionen werden mit folgenden Informationen gespeichert:

- Transaktions-ID (UUID)
- Transaktionstyp (MOTO)
- Protokollversion (101.1)
- Kartendaten (maskiert)
- Betrag und Währung
- Approval Code
- Zeitstempel
- Status

## Datenstruktur

Alle Daten werden im `backend/data` Ordner gespeichert:

- `config.json`: API-Konfiguration und Geräteinformationen
- `transactions.json`: Alle Transaktionen
- `devices.json`: Verbundene Geräte

## API Endpunkte

### Backend API

- `GET /api/config` - Konfiguration abrufen
- `PUT /api/config` - Konfiguration aktualisieren
- `POST /api/transaction/moto` - MOTO Transaktion durchführen
- `GET /api/transactions` - Alle Transaktionen abrufen
- `GET /api/transactions/:id` - Transaktion nach ID abrufen
- `POST /api/devices/register` - Gerät registrieren
- `POST /api/devices/connect` - Geräteverbindung empfangen
- `GET /api/devices` - Verbundene Geräte abrufen
- `POST /api/devices/:deviceId/transaction` - Transaktion an Gerät senden

## Technologie-Stack

- **Backend**: Node.js, Express.js
- **Frontend**: React, Vite
- **Datenbank**: JSON-Dateien (kann einfach durch eine echte Datenbank ersetzt werden)

## Sicherheit

⚠️ **Wichtiger Hinweis**: Dies ist eine Demo-Anwendung. Für den Produktionseinsatz sollten folgende Sicherheitsmaßnahmen implementiert werden:

- Verschlüsselung der Kartendaten
- HTTPS für alle Verbindungen
- Authentifizierung und Autorisierung
- PCI-DSS Compliance
- Sichere Speicherung sensibler Daten

## Lizenz

MIT

