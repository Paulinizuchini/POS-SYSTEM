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
    console.log("FETCH STARTET JETZT");
    
    try {
      const response = await
    fetch('https://pos-system-backend-ts8m.onrender.com/api/test');
          
      console.log("STATUS:", response.status);
      
      const data = await response.json();
      console.error("FETCH FEHLER:", err);
    }  
      
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





