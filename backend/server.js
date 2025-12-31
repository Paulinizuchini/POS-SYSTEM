import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.get("/", (req, res) => {
  res.send("Backend läuft");
});
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Datenbank-Dateien
const configFile = path.join(__dirname, 'data', 'config.json');
const transactionsFile = path.join(__dirname, 'data', 'transactions.json');
const devicesFile = path.join(__dirname, 'data', 'devices.json');

// Stelle sicher, dass data Ordner existiert
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialisiere Dateien falls sie nicht existieren
function initFiles() {
  if (!fs.existsSync(configFile)) {
    fs.writeFileSync(configFile, JSON.stringify({
      apiUrl: '',
      apiKey: '',
      deviceId: uuidv4(),
      deviceName: 'POS Device 1'
    }, null, 2));
  }
  if (!fs.existsSync(transactionsFile)) {
    fs.writeFileSync(transactionsFile, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(devicesFile)) {
    fs.writeFileSync(devicesFile, JSON.stringify([], null, 2));
  }
}

initFiles();

// Hilfsfunktionen
function readJSON(file) {
  try {
    const data = fs.readFileSync(file, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// API Konfiguration abrufen
app.get('/api/config', (req, res) => {
  const config = readJSON(configFile);
  res.json(config);
});

// API Konfiguration aktualisieren
app.put('/api/config', (req, res) => {
  const { apiUrl, apiKey, deviceName } = req.body;
  const config = readJSON(configFile);
  
  if (apiUrl !== undefined) config.apiUrl = apiUrl;
  if (apiKey !== undefined) config.apiKey = apiKey;
  if (deviceName !== undefined) config.deviceName = deviceName;
  
  writeJSON(configFile, config);
  res.json({ success: true, config });
});

// MOTO Transaktion durchführen (Protokoll 101.1)
app.post('/api/transaction/moto', async (req, res) => {
  try {
    const {
      cardNumber,
      expiryDate,
      cvv,
      cardHolder,
      amount,
      approvalCode,
      currency = 'EUR'
    } = req.body;

    // Validierung
    if (!cardNumber || cardNumber.length !== 16) {
      return res.status(400).json({ 
        success: false, 
        error: 'Kartennummer muss 16 Stellen haben' 
      });
    }

    if (!expiryDate || !/^\d{2}\/\d{2}$/.test(expiryDate)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Ablaufdatum muss im Format MM/YY sein' 
      });
    }

    if (!cvv || (cvv.length !== 3 && cvv.length !== 4)) {
      return res.status(400).json({ 
        success: false, 
        error: 'CVV muss 3 oder 4 Stellen haben' 
      });
    }

    if (!cardHolder) {
      return res.status(400).json({ 
        success: false, 
        error: 'Kartenbesitzer ist erforderlich' 
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Betrag muss größer als 0 sein' 
      });
    }

    if (!approvalCode || (approvalCode.length !== 4 && approvalCode.length !== 6)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Approval Code muss 4 oder 6 Stellen haben' 
      });
    }

    // Transaktionsdaten erstellen (Protokoll 101.1 Format)
    const transaction = {
      id: uuidv4(),
      type: 'MOTO',
      protocol: '101.1',
      timestamp: new Date().toISOString(),
      cardNumber: cardNumber.replace(/\d(?=\d{4})/g, '*'), // Maskierung
      expiryDate,
      cvv: '***',
      cardHolder,
      amount: parseFloat(amount),
      currency,
      approvalCode,
      status: 'pending'
    };

    // Konfiguration lesen
    const config = readJSON(configFile);
    
    // Wenn API URL konfiguriert ist, Transaktion an externe API senden
    if (config.apiUrl) {
      try {
        const response = await axios.post(
          `${config.apiUrl}/api/transaction/process`,
          {
            ...transaction,
            deviceId: config.deviceId,
            deviceName: config.deviceName
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': config.apiKey ? `Bearer ${config.apiKey}` : undefined
            },
            timeout: 10000
          }
        );

        transaction.status = response.data.success ? 'approved' : 'declined';
        transaction.externalResponse = response.data;
      } catch (error) {
        console.error('Externe API Fehler:', error.message);
        transaction.status = 'error';
        transaction.error = error.message;
      }
    } else {
      // Lokale Verarbeitung (Simulation)
      transaction.status = 'approved';
      transaction.localProcessing = true;
    }

    // Transaktion speichern
    const transactions = readJSON(transactionsFile) || [];
    transactions.push(transaction);
    writeJSON(transactionsFile, transactions);

    res.json({
      success: transaction.status === 'approved',
      transaction: {
        id: transaction.id,
        status: transaction.status,
        amount: transaction.amount,
        currency: transaction.currency,
        approvalCode: transaction.approvalCode,
        timestamp: transaction.timestamp
      }
    });
  } catch (error) {
    console.error('Transaktionsfehler:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Interner Serverfehler' 
    });
  }
});

// Transaktionen abrufen
app.get('/api/transactions', (req, res) => {
  const transactions = readJSON(transactionsFile) || [];
  res.json(transactions.reverse()); // Neueste zuerst
});

// Transaktion nach ID abrufen
app.get('/api/transactions/:id', (req, res) => {
  const transactions = readJSON(transactionsFile) || [];
  const transaction = transactions.find(t => t.id === req.params.id);
  
  if (!transaction) {
    return res.status(404).json({ error: 'Transaktion nicht gefunden' });
  }
  
  res.json(transaction);
});

// Gerät registrieren (für Verbindung mit anderen Geräten)
app.post('/api/devices/register', async (req, res) => {
  try {
    const { deviceUrl, deviceName, deviceId } = req.body;
    
    if (!deviceUrl) {
      return res.status(400).json({ 
        success: false, 
        error: 'Geräte-URL ist erforderlich' 
      });
    }

    const config = readJSON(configFile);
    const devices = readJSON(devicesFile) || [];

    // Prüfe ob Gerät bereits registriert ist
    const existingDevice = devices.find(d => d.deviceUrl === deviceUrl);
    
    if (existingDevice) {
      return res.json({ 
        success: true, 
        message: 'Gerät bereits registriert',
        device: existingDevice 
      });
    }

    // Versuche Verbindung zum anderen Gerät herzustellen
    try {
      const response = await axios.post(
        `${deviceUrl}/api/devices/connect`,
        {
          deviceId: config.deviceId,
          deviceName: config.deviceName,
          deviceUrl: process.env.BASE_URL
        },
        {
          timeout: 5000
        }
      );

      const newDevice = {
        id: deviceId || uuidv4(),
        deviceUrl,
        deviceName: deviceName || 'Unbekanntes Gerät',
        connectedAt: new Date().toISOString(),
        status: 'connected'
      };

      devices.push(newDevice);
      writeJSON(devicesFile, devices);

      res.json({
        success: true,
        message: 'Gerät erfolgreich verbunden',
        device: newDevice
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: `Verbindung fehlgeschlagen: ${error.message}`
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Interner Serverfehler' 
    });
  }
});

// Geräteverbindung empfangen
app.post('/api/devices/connect', (req, res) => {
  try {
    const { deviceId, deviceName, deviceUrl } = req.body;
    
    const devices = readJSON(devicesFile) || [];
    
    const newDevice = {
      id: deviceId,
      deviceUrl,
      deviceName: deviceName || 'Unbekanntes Gerät',
      connectedAt: new Date().toISOString(),
      status: 'connected'
    };

    // Prüfe ob bereits vorhanden
    const existingIndex = devices.findIndex(d => d.deviceId === deviceId);
    if (existingIndex >= 0) {
      devices[existingIndex] = newDevice;
    } else {
      devices.push(newDevice);
    }

    writeJSON(devicesFile, devices);

    res.json({
      success: true,
      message: 'Verbindung akzeptiert',
      device: newDevice
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Interner Serverfehler' 
    });
  }
});

// Verbundene Geräte abrufen
app.get('/api/devices', (req, res) => {
  const devices = readJSON(devicesFile) || [];
  res.json(devices);
});

// Transaktion an verbundenes Gerät senden
app.post('/api/devices/:deviceId/transaction', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const transactionData = req.body;

    const devices = readJSON(devicesFile) || [];
    const device = devices.find(d => d.id === deviceId);

    if (!device) {
      return res.status(404).json({ 
        success: false, 
        error: 'Gerät nicht gefunden' 
      });
    }

    try {
      const response = await axios.post(
        `${device.deviceUrl}/api/transaction/moto`,
        transactionData,
        {
          timeout: 10000
        }
      );

      res.json({
        success: true,
        response: response.data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: `Fehler beim Senden: ${error.message}`
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Interner Serverfehler' 
    });
  }
});

// Server starten
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend läuft" });
});
app.get("/api/test", (req, res) => {
  res.json({ message: "API LÄUFT" });
});
app.listen(PORT, "0.0.0.0", () => {
  console.log(`POS Backend Server läuft auf Port ${PORT}`);
  console.log(`API gestartet`);
});










