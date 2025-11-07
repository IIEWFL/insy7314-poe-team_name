import React, { useEffect, useState } from 'react';

const AllPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const API_BASE =
    process.env.REACT_APP_API_BASE_URL ||
    (window.location.protocol === 'https:'
      ? 'https://localhost:8001'
      : 'http://localhost:8001');

  useEffect(() => {
    const fetchAllPayments = async () => {
      try {
        const token = localStorage.getItem('employeeToken');
        if (!token) {
          setError('You must be logged in.');
          setLoading(false);
          return;
        }

        const url = statusFilter
          ? `${API_BASE}/api/employee/verifications/payments?status=${statusFilter}`
          : `${API_BASE}/api/employee/verifications/payments`;

        const response = await fetch(url, {
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

    fetchAllPayments();
  }, [API_BASE, statusFilter]);

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: 40 }}>Loading all payments...</div>;
  }

  if (error) {
    return <div style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>{error}</div>;
  }

  return (
    <div style={containerStyle}>
      <h2 style={{ textAlign: 'center', marginBottom: 20 }}>All Customer Payments</h2>

      <div style={{ marginBottom: 20, textAlign: 'center' }}>
        <label>Filter by Status: </label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={selectStyle}
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="denied">Denied</option>
          <option value="failed">Failed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {payments.length === 0 ? (
        <p style={{ textAlign: 'center' }}>No payments found.</p>
      ) : (
        <table style={tableStyle}>
          <thead style={headerStyle}>
            <tr>
              <th style={cellStyle}>Customer</th>
              <th style={cellStyle}>Amount</th>
              <th style={cellStyle}>Currency</th>
              <th style={cellStyle}>Provider</th>
              <th style={cellStyle}>Recipient</th>
              <th style={cellStyle}>Status</th>
              <th style={cellStyle}>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p._id}>
                <td style={cellStyle}>
                  {p.customer?.fullName || 'Unknown'}
                  <br />
                  <small>{p.customer?.email}</small>
                </td>
                <td style={cellStyle}>{p.amount}</td>
                <td style={cellStyle}>{p.currency}</td>
                <td style={cellStyle}>{p.provider}</td>
                <td style={cellStyle}>{p.recipientAccount}</td>
                <td style={cellStyle}>
                  <span style={getStatusBadge(p.status)}>{p.status}</span>
                </td>
                <td style={cellStyle}>{new Date(p.timestamp).toLocaleString()}</td>
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
    failed: { background: '#f8d7da', color: '#721c24' },
    cancelled: { background: '#e2e3e5', color: '#383d41' },
  };

  return { ...baseStyle, ...(colors[status] || colors.pending) };
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

const selectStyle = {
  padding: '8px 12px',
  fontSize: 14,
  borderRadius: 4,
  border: '1px solid #ccc',
  marginLeft: 10,
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

export default AllPayments;