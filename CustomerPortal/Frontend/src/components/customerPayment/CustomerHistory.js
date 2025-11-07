import React, { useEffect, useState } from 'react';

const CustomerHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE =
    process.env.REACT_APP_API_BASE_URL ||
    (window.location.protocol === 'https:'
      ? 'https://localhost:8000'
      : 'http://localhost:8000');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('You must be logged in to view your payment history.');
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE}/api/customerPayments/my-payments`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Failed to fetch payments');
        }

        const data = await response.json();
        setPayments(data.payments || []);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [API_BASE]);

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: 40 }}>Loading your payments...</div>;
  }

  if (error) {
    return <div style={{ color: '#b00020', textAlign: 'center', marginTop: 40 }}>{error}</div>;
  }

  return (
    <div style={containerStyle}>
      <h2 style={{ textAlign: 'center', marginBottom: 20 }}>My Payment History</h2>

      {payments.length === 0 ? (
        <p style={{ textAlign: 'center' }}>No payments found.</p>
      ) : (
        <table style={tableStyle}>
          <thead style={headerStyle}>
            <tr>
              <th style={cellStyle}>Amount</th>
              <th style={cellStyle}>Currency</th>
              <th style={cellStyle}>Provider</th>
              <th style={cellStyle}>Recipient Account</th>
              <th style={cellStyle}>Status</th>
              <th style={cellStyle}>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p._id}>
                <td style={cellStyle}>{p.amount}</td>
                <td style={cellStyle}>{p.currency}</td>
                <td style={cellStyle}>{p.provider}</td>
                <td style={cellStyle}>{p.recipientAccount}</td>
                <td style={cellStyle}>{p.status}</td>
                <td style={cellStyle}>{new Date(p.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// Updated Styles to match Dashboard theme
const containerStyle = {
  maxWidth: '1200px',
  margin: '40px auto',
  padding: '30px',
  background: 'white',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  border: '1px solid #e0e0e0',
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
};

const cellStyle = {
  padding: '16px',
  borderBottom: '1px solid #e0e0e0',
  textAlign: 'left',
  fontSize: '14px',
};

const headerStyle = {
  background: '#1976d2',
  color: 'white',
};

export default CustomerHistory;