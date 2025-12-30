import React, { useState, useEffect } from 'react';
import TransactionForm from './components/TransactionForm';
import ConfigPanel from './components/ConfigPanel';
import DeviceManager from './components/DeviceManager';
import TransactionHistory from './components/TransactionHistory';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('transaction');
  const [config, setConfig] = useState(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/config');
      const data = await response.json();
      setConfig(data);
    } catch (error) {
      console.error('Fehler beim Laden der Konfiguration:', error);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>POS System 101.1</h1>
        <p className="subtitle">MOTO Transaktionssystem</p>
      </header>

      <nav className="tabs">
        <button
          className={activeTab === 'transaction' ? 'active' : ''}
          onClick={() => setActiveTab('transaction')}
        >
          Transaktion
        </button>
        <button
          className={activeTab === 'history' ? 'active' : ''}
          onClick={() => setActiveTab('history')}
        >
          Verlauf
        </button>
        <button
          className={activeTab === 'config' ? 'active' : ''}
          onClick={() => setActiveTab('config')}
        >
          API Konfiguration
        </button>
        <button
          className={activeTab === 'devices' ? 'active' : ''}
          onClick={() => setActiveTab('devices')}
        >
          Geräte
        </button>
      </nav>

      <main className="main-content">
        {activeTab === 'transaction' && <TransactionForm />}
        {activeTab === 'history' && <TransactionHistory />}
        {activeTab === 'config' && <ConfigPanel onConfigUpdate={loadConfig} />}
        {activeTab === 'devices' && <DeviceManager />}
      </main>
    </div>
  );
}

export default App;

