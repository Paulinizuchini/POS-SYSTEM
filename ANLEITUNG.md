# Schnellstart-Anleitung

## Installation (einmalig)

Die Dependencies wurden bereits installiert. Falls Sie die Installation wiederholen möchten:

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

## System starten

### Option 1: Automatischer Start (empfohlen)
Doppelklicken Sie auf `start.bat` im Hauptordner. Dies startet automatisch Backend und Frontend.

### Option 2: Manueller Start

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```
Das Backend läuft auf: http://localhost:3001

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Das Frontend läuft auf: http://localhost:3000

### Option 3: Separate Batch-Dateien
- `start-backend.bat` - Startet nur das Backend
- `start-frontend.bat` - Startet nur das Frontend

## Verwendung

1. Öffnen Sie Ihren Browser und navigieren Sie zu: **http://localhost:3000**

2. **Transaktion durchführen:**
   - Klicken Sie auf den Tab "Transaktion"
   - Geben Sie alle Kartendaten ein:
     - Kartennummer (16 Stellen)
     - Ablaufdatum (MM/YY Format)
     - CVV (3-4 Stellen)
     - Kartenbesitzer
     - Betrag
     - Approval Code (4 oder 6 Stellen)
   - Klicken Sie auf "Transaktion durchführen"

3. **API konfigurieren:**
   - Klicken Sie auf den Tab "API Konfiguration"
   - Geben Sie die API-URL ein (z.B. `http://192.168.1.100:3001`)
   - Optional: API-Key eingeben
   - Klicken Sie auf "Konfiguration speichern"

4. **Gerät verbinden:**
   - Klicken Sie auf den Tab "Geräte"
   - Geben Sie die URL des anderen POS-Geräts ein
   - Klicken Sie auf "Gerät verbinden"

5. **Transaktionsverlauf ansehen:**
   - Klicken Sie auf den Tab "Verlauf"
   - Alle Transaktionen werden angezeigt
   - Klicken Sie auf eine Transaktion für Details

## Wichtige Hinweise

- **Backend muss laufen**: Das Frontend benötigt das Backend, um zu funktionieren
- **Ports**: Stellen Sie sicher, dass Port 3000 und 3001 frei sind
- **Netzwerk**: Für Geräteverbindungen über das Netzwerk müssen beide Geräte erreichbar sein
- **Firewall**: Möglicherweise müssen Sie die Firewall für die Ports 3000 und 3001 öffnen

## Fehlerbehebung

**Backend startet nicht:**
- Prüfen Sie, ob Port 3001 bereits belegt ist
- Führen Sie `npm install` im backend-Ordner erneut aus

**Frontend startet nicht:**
- Prüfen Sie, ob Port 3000 bereits belegt ist
- Führen Sie `npm install` im frontend-Ordner erneut aus

**Transaktionen funktionieren nicht:**
- Stellen Sie sicher, dass das Backend läuft
- Prüfen Sie die Browser-Konsole auf Fehler (F12)

## Daten

Alle Daten werden im `backend/data` Ordner gespeichert:
- `config.json` - Konfiguration
- `transactions.json` - Transaktionen
- `devices.json` - Verbundene Geräte

Diese Dateien werden automatisch erstellt beim ersten Start.

