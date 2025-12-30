import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ConfigPanel.css';

function ConfigPanel({ onConfigUpdate }) {
  const [config, setConfig] = useState({
    apiUrl: '',
    apiKey: '',
    deviceName: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await axios.get('/api/config');
      setConfig(response.data);
    } catch (error) {
      console.error('Fehler beim Laden der Konfiguration:', error);
      setMessage({ type: 'error', text: 'Fehler beim Laden der Konfiguration' });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig({ ...config, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await axios.put('/api/config', config);
      setMessage({ type: 'success', text: 'Konfiguration erfolgreich gespeichert!' });
      if (onConfigUpdate) {
        onConfigUpdate();
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Fehler beim Speichern der Konfiguration' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    if (!config.apiUrl) {
      setMessage({ type: 'error', text: 'Bitte geben Sie eine API URL ein' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await axios.get(`${config.apiUrl}/api/config`, {
        timeout: 5000,
        headers: config.apiKey ? {
          'Authorization': `Bearer ${config.apiKey}`
        } : {}
      });
      setMessage({ type: 'success', text: 'Verbindung erfolgreich!' });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: `Verbindung fehlgeschlagen: ${error.message}` 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="config-panel">
      <h2>API Konfiguration</h2>
      <p className="config-description">
        Konfigurieren Sie die API-Verbindung für externe Transaktionsverarbeitung.
        Die API URL kann geändert werden, um mit anderen Geräten zu kommunizieren.
      </p>

      <form onSubmit={handleSubmit} className="config-form">
        <div className="form-group">
          <label htmlFor="deviceName">Gerätename</label>
          <input
            type="text"
            id="deviceName"
            name="deviceName"
            value={config.deviceName || ''}
            onChange={handleChange}
            placeholder="POS Device 1"
          />
        </div>

        <div className="form-group">
          <label htmlFor="apiUrl">API URL</label>
          <input
            type="url"
            id="apiUrl"
            name="apiUrl"
            value={config.apiUrl || ''}
            onChange={handleChange}
            placeholder="https://api.example.com"
          />
          <div className="input-hint">
            Vollständige URL des Backend-Servers (z.B. http://192.168.1.100:3001)
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="apiKey">API Key (optional)</label>
          <input
            type="password"
            id="apiKey"
            name="apiKey"
            value={config.apiKey || ''}
            onChange={handleChange}
            placeholder="Ihr API-Schlüssel"
          />
          <div className="input-hint">
            Optional: API-Schlüssel für Authentifizierung
          </div>
        </div>

        {message && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="button-group">
          <button
            type="button"
            onClick={handleTestConnection}
            className="button-secondary"
            disabled={loading || !config.apiUrl}
          >
            Verbindung testen
          </button>
          <button
            type="submit"
            className="button-primary"
            disabled={loading}
          >
            {loading ? 'Wird gespeichert...' : 'Konfiguration speichern'}
          </button>
        </div>
      </form>

      <div className="device-info">
        <h3>Geräteinformationen</h3>
        <div className="info-item">
          <strong>Geräte-ID:</strong> {config.deviceId || 'Wird geladen...'}
        </div>
        <div className="info-item">
          <strong>Lokale API URL:</strong> http://localhost:3001
        </div>
      </div>
    </div>
  );
}

export default ConfigPanel;

