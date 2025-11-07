import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PendingPayments = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE =
    process.env.REACT_APP_API_BASE_URL ||
    (window.location.protocol === 'https:'
      ? 'https://localhost:8001'
      : 'http://localhost:8001');

  useEffect(() => {
    const fetchPendingPayments = async () => {
      try {
        const token = localStorage.getItem('employeeToken');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch(`${API_BASE}/api/employee/verifications/pending-payments`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Failed to fetch pending payments');
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

    fetchPendingPayments();
  }, [API_BASE, navigate]);

  const handleVerifyClick = (paymentId) => {
    navigate(`/verification/verify/${paymentId}`);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: 40 }}>Loading pending payments...</div>;
  }

  if (error) {
    return <div style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>{error}</div>;
  }

  return (
    <div style={containerStyle}>
      <h2 style={{ textAlign: 'center', marginBottom: 20 }}>Pending Payments</h2>

      {payments.length === 0 ? (
        <p style={{ textAlign: 'center' }}>No pending payments found.</p>
      ) : (
        <table style={tableStyle}>
          <thead style={headerStyle}>
            <tr>
              <th style={cellStyle}>Customer</th>
              <th style={cellStyle}>Amount</th>
              <th style={cellStyle}>Currency</th>
              <th style={cellStyle}>Provider</th>
              <th style={cellStyle}>Recipient Account</th>
              <th style={cellStyle}>Status</th>
              <th style={cellStyle}>Timestamp</th>
              <th style={cellStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p._id}>
                <td style={cellStyle}>
                  {p.customer?.fullName || 'Unknown'}
                  <br />
                  <small>{p.customer?.accountNumber}</small>
                </td>
                <td style={cellStyle}>{p.amount}</td>
                <td style={cellStyle}>{p.currency}</td>
                <td style={cellStyle}>{p.provider}</td>
                <td style={cellStyle}>{p.recipientAccount}</td>
                <td style={cellStyle}>
                  <span style={getStatusBadge(p.status)}>{p.status}</span>
                </td>
                <td style={cellStyle}>{new Date(p.timestamp).toLocaleString()}</td>
                <td style={cellStyle}>
                  <button onClick={() => handleVerifyClick(p._id)} style={buttonStyle}>
                    Verify
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const getStatusBadge = (status) => {
  const baseStyle = {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold',
  };

  const colors = {
    pending: { background: '#fff3cd', color: '#856404' },
    processing: { background: '#d1ecf1', color: '#0c5460' },
    completed: { background: '#d4edda', color: '#155724' },
    denied: { background: '#f8d7da', color: '#721c24' },
  };

  return { ...baseStyle, ...colors[status] };
};

// Styles
const containerStyle = {
  maxWidth: '1400px',
  margin: '30px auto',
  background: '#f9f9f9',
  padding: '20px',
  borderRadius: '12px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  background: 'white',
};

const cellStyle = {
  padding: '12px',
  borderBottom: '1px solid #ddd',
  textAlign: 'left',
};

const headerStyle = {
  background: '#1976d2',
  color: 'white',
};

const buttonStyle = {
  padding: '6px 12px',
  background: '#1976d2',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 13,
};

export default PendingPayments;