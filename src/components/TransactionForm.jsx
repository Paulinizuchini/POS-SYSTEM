import React, { useState } from 'react';
import axios from 'axios';
import './TransactionForm.css';

function TransactionForm() {
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolder: '',
    amount: '',
    approvalCode: '',
    currency: 'EUR'
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Formatierung für Kartennummer (nur Zahlen, max 16)
    if (name === 'cardNumber') {
      const numbers = value.replace(/\D/g, '').slice(0, 16);
      setFormData({ ...formData, [name]: numbers });
      return;
    }

    // Formatierung für Ablaufdatum (MM/YY)
    if (name === 'expiryDate') {
      const numbers = value.replace(/\D/g, '');
      let formatted = numbers;
      if (numbers.length >= 2) {
        formatted = numbers.slice(0, 2) + '/' + numbers.slice(2, 4);
      }
      setFormData({ ...formData, [name]: formatted });
      return;
    }

    // Formatierung für CVV (nur Zahlen, max 4)
    if (name === 'cvv') {
      const numbers = value.replace(/\D/g, '').slice(0, 4);
      setFormData({ ...formData, [name]: numbers });
      return;
    }

    // Formatierung für Approval Code (nur Zahlen, max 6)
    if (name === 'approvalCode') {
      const numbers = value.replace(/\D/g, '').slice(0, 6);
      setFormData({ ...formData, [name]: numbers });
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post('/api/transaction/moto', formData);
      
      if (response.data.success) {
        setResult({
          success: true,
          message: 'Transaktion erfolgreich!',
          transaction: response.data.transaction
        });
        // Formular zurücksetzen
        setFormData({
          cardNumber: '',
          expiryDate: '',
          cvv: '',
          cardHolder: '',
          amount: '',
          approvalCode: '',
          currency: 'EUR'
        });
      } else {
        setError('Transaktion fehlgeschlagen');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transaction-form-container">
      <h2>MOTO Transaktion (Protokoll 101.1)</h2>
      
      <form onSubmit={handleSubmit} className="transaction-form">
        <div className="form-group">
          <label htmlFor="cardNumber">Kartennummer (16 Stellen)</label>
          <input
            type="text"
            id="cardNumber"
            name="cardNumber"
            value={formData.cardNumber}
            onChange={handleChange}
            placeholder="1234 5678 9012 3456"
            maxLength="16"
            required
            className="card-input"
          />
          <div className="input-hint">
            {formData.cardNumber.length}/16 Stellen
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="expiryDate">Ablaufdatum (MM/YY)</label>
            <input
              type="text"
              id="expiryDate"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              placeholder="12/25"
              maxLength="5"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="cvv">CVV (3-4 Stellen)</label>
            <input
              type="text"
              id="cvv"
              name="cvv"
              value={formData.cvv}
              onChange={handleChange}
              placeholder="123"
              maxLength="4"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="cardHolder">Kartenbesitzer</label>
          <input
            type="text"
            id="cardHolder"
            name="cardHolder"
            value={formData.cardHolder}
            onChange={handleChange}
            placeholder="MAX MUSTERMANN"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="amount">Betrag</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="currency">Währung</label>
            <select
              id="currency"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
            >
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
              <option value="GBP">GBP</option>
              <option value="CHF">CHF</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="approvalCode">Approval Code (4 oder 6 Stellen)</label>
          <input
            type="text"
            id="approvalCode"
            name="approvalCode"
            value={formData.approvalCode}
            onChange={handleChange}
            placeholder="123456"
            maxLength="6"
            required
          />
          <div className="input-hint">
            {formData.approvalCode.length} Stellen
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {result && result.success && (
          <div className="alert alert-success">
            <h3>✓ {result.message}</h3>
            <div className="transaction-details">
              <p><strong>Transaktions-ID:</strong> {result.transaction.id}</p>
              <p><strong>Status:</strong> {result.transaction.status}</p>
              <p><strong>Betrag:</strong> {result.transaction.amount} {result.transaction.currency}</p>
              <p><strong>Approval Code:</strong> {result.transaction.approvalCode}</p>
              <p><strong>Zeitpunkt:</strong> {new Date(result.transaction.timestamp).toLocaleString('de-DE')}</p>
            </div>
          </div>
        )}

        <button
          type="submit"
          className="submit-button"
          disabled={loading}
        >
          {loading ? 'Wird verarbeitet...' : 'Transaktion durchführen'}
        </button>
      </form>
    </div>
  );
}

export default TransactionForm;

