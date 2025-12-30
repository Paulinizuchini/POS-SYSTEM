import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DeviceManager.css';

function DeviceManager() {
  const [devices, setDevices] = useState([]);
  const [newDeviceUrl, setNewDeviceUrl] = useState('');
  const [newDeviceName, setNewDeviceName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      const response = await axios.get('/api/devices');
      setDevices(response.data);
    } catch (error) {
      console.error('Fehler beim Laden der Geräte:', error);
    }
  };

  const handleConnectDevice = async (e) => {
    e.preventDefault();
    
    if (!newDeviceUrl) {
      setMessage({ type: 'error', text: 'Bitte geben Sie eine Geräte-URL ein' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await axios.post('/api/devices/register', {
        deviceUrl: newDeviceUrl,
        deviceName: newDeviceName || 'Unbekanntes Gerät'
      });

      if (response.data.success) {
        setMessage({ type: 'success', text: response.data.message });
        setNewDeviceUrl('');
        setNewDeviceName('');
        loadDevices();
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Fehler beim Verbinden des Geräts' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDevice = async (deviceId) => {
    if (!window.confirm('Möchten Sie dieses Gerät wirklich entfernen?')) {
      return;
    }

    try {
      // Hier könnte ein DELETE-Endpoint implementiert werden
      // Für jetzt entfernen wir es nur lokal
      const updatedDevices = devices.filter(d => d.id !== deviceId);
      setDevices(updatedDevices);
      setMessage({ type: 'success', text: 'Gerät entfernt' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Fehler beim Entfernen des Geräts' });
    }
  };

  return (
    <div className="device-manager">
      <h2>Geräteverwaltung</h2>
      <p className="description">
        Verbinden Sie dieses POS-Gerät mit anderen Geräten über ihre API-URL.
        Die Geräte müssen nicht im gleichen Netzwerk sein.
      </p>

      <div className="connect-device-section">
        <h3>Neues Gerät verbinden</h3>
        <form onSubmit={handleConnectDevice} className="connect-form">
          <div className="form-group">
            <label htmlFor="deviceUrl">Geräte-URL</label>
            <input
              type="url"
              id="deviceUrl"
              value={newDeviceUrl}
              onChange={(e) => setNewDeviceUrl(e.target.value)}
              placeholder="http://192.168.1.100:3001 oder https://api.example.com"
              required
            />
            <div className="input-hint">
              Vollständige URL des anderen POS-Geräts
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="deviceName">Gerätename (optional)</label>
            <input
              type="text"
              id="deviceName"
              value={newDeviceName}
              onChange={(e) => setNewDeviceName(e.target.value)}
              placeholder="POS Device 2"
            />
          </div>

          {message && (
            <div className={`alert alert-${message.type}`}>
              {message.text}
            </div>
          )}

          <button
            type="submit"
            className="connect-button"
            disabled={loading || !newDeviceUrl}
          >
            {loading ? 'Wird verbunden...' : 'Gerät verbinden'}
          </button>
        </form>
      </div>

      <div className="devices-list">
        <h3>Verbundene Geräte</h3>
        {devices.length === 0 ? (
          <div className="no-devices">
            <p>Keine Geräte verbunden</p>
            <p className="hint">Verbinden Sie ein Gerät über die URL oben</p>
          </div>
        ) : (
          <div className="devices-grid">
            {devices.map((device) => (
              <div key={device.id} className="device-card">
                <div className="device-header">
                  <h4>{device.deviceName}</h4>
                  <span className={`status-badge status-${device.status}`}>
                    {device.status === 'connected' ? '✓ Verbunden' : '✗ Getrennt'}
                  </span>
                </div>
                <div className="device-info">
                  <div className="info-row">
                    <strong>URL:</strong>
                    <span className="device-url">{device.deviceUrl}</span>
                  </div>
                  <div className="info-row">
                    <strong>ID:</strong>
                    <span className="device-id">{device.id}</span>
                  </div>
                  {device.connectedAt && (
                    <div className="info-row">
                      <strong>Verbunden seit:</strong>
                      <span>{new Date(device.connectedAt).toLocaleString('de-DE')}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleRemoveDevice(device.id)}
                  className="remove-button"
                >
                  Entfernen
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DeviceManager;

