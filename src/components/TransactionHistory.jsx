import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TransactionHistory.css';

function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  useEffect(() => {
    loadTransactions();
    // Aktualisiere alle 5 Sekunden
    const interval = setInterval(loadTransactions, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadTransactions = async () => {
    try {
      const response = await axios.get('/api/transactions');
      setTransactions(response.data);
    } catch (error) {
      console.error('Fehler beim Laden der Transaktionen:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'status-approved';
      case 'declined':
        return 'status-declined';
      case 'pending':
        return 'status-pending';
      case 'error':
        return 'status-error';
      default:
        return '';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved':
        return '✓ Genehmigt';
      case 'declined':
        return '✗ Abgelehnt';
      case 'pending':
        return '⏳ Ausstehend';
      case 'error':
        return '⚠ Fehler';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="transaction-history">
        <h2>Transaktionsverlauf</h2>
        <div className="loading">Lädt...</div>
      </div>
    );
  }

  return (
    <div className="transaction-history">
      <div className="history-header">
        <h2>Transaktionsverlauf</h2>
        <button onClick={loadTransactions} className="refresh-button">
          Aktualisieren
        </button>
      </div>

      {transactions.length === 0 ? (
        <div className="no-transactions">
          <p>Keine Transaktionen vorhanden</p>
          <p className="hint">Führen Sie Ihre erste Transaktion durch</p>
        </div>
      ) : (
        <>
          <div className="transactions-list">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className={`transaction-item ${selectedTransaction?.id === transaction.id ? 'selected' : ''}`}
                onClick={() => setSelectedTransaction(transaction)}
              >
                <div className="transaction-main">
                  <div className="transaction-left">
                    <div className="transaction-id">ID: {transaction.id.substring(0, 8)}...</div>
                    <div className="transaction-time">
                      {new Date(transaction.timestamp).toLocaleString('de-DE')}
                    </div>
                  </div>
                  <div className="transaction-right">
                    <div className="transaction-amount">
                      {transaction.amount} {transaction.currency}
                    </div>
                    <div className={`transaction-status ${getStatusColor(transaction.status)}`}>
                      {getStatusText(transaction.status)}
                    </div>
                  </div>
                </div>
                <div className="transaction-type">
                  {transaction.type} - Protokoll {transaction.protocol}
                </div>
              </div>
            ))}
          </div>

          {selectedTransaction && (
            <div className="transaction-details-modal">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>Transaktionsdetails</h3>
                  <button
                    onClick={() => setSelectedTransaction(null)}
                    className="close-button"
                  >
                    ×
                  </button>
                </div>
                <div className="modal-body">
                  <div className="detail-row">
                    <strong>Transaktions-ID:</strong>
                    <span>{selectedTransaction.id}</span>
                  </div>
                  <div className="detail-row">
                    <strong>Typ:</strong>
                    <span>{selectedTransaction.type}</span>
                  </div>
                  <div className="detail-row">
                    <strong>Protokoll:</strong>
                    <span>{selectedTransaction.protocol}</span>
                  </div>
                  <div className="detail-row">
                    <strong>Status:</strong>
                    <span className={getStatusColor(selectedTransaction.status)}>
                      {getStatusText(selectedTransaction.status)}
                    </span>
                  </div>
                  <div className="detail-row">
                    <strong>Betrag:</strong>
                    <span>{selectedTransaction.amount} {selectedTransaction.currency}</span>
                  </div>
                  <div className="detail-row">
                    <strong>Kartennummer:</strong>
                    <span>{selectedTransaction.cardNumber}</span>
                  </div>
                  <div className="detail-row">
                    <strong>Ablaufdatum:</strong>
                    <span>{selectedTransaction.expiryDate}</span>
                  </div>
                  <div className="detail-row">
                    <strong>Kartenbesitzer:</strong>
                    <span>{selectedTransaction.cardHolder}</span>
                  </div>
                  <div className="detail-row">
                    <strong>Approval Code:</strong>
                    <span>{selectedTransaction.approvalCode}</span>
                  </div>
                  <div className="detail-row">
                    <strong>Zeitpunkt:</strong>
                    <span>{new Date(selectedTransaction.timestamp).toLocaleString('de-DE')}</span>
                  </div>
                  {selectedTransaction.error && (
                    <div className="detail-row error">
                      <strong>Fehler:</strong>
                      <span>{selectedTransaction.error}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default TransactionHistory;

