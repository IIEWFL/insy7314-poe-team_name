import React, { useEffect, useState } from 'react';

const VerificationHistory = () => {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const API_BASE =
    process.env.REACT_APP_API_BASE_URL ||
    (window.location.protocol === 'https:'
      ? 'https://localhost:8001'
      : 'http://localhost:8001');

  useEffect(() => {
    const fetchVerifications = async () => {
      try {
        const token = localStorage.getItem('employeeToken');
        if (!token) {
          setError('You must be logged in.');
          setLoading(false);
          return;
        }

        const url = statusFilter
          ? `${API_BASE}/api/employee/verifications/all?status=${statusFilter}`
          : `${API_BASE}/api/employee/verifications/all`;

        const response = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Failed to fetch verifications');
        }

        const data = await response.json();
        setVerifications(data.verifications || []);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchVerifications();
  }, [API_BASE, statusFilter]);

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: 40 }}>Loading verification history...</div>;
  }

  if (error) {
    return <div style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>{error}</div>;
  }

  return (
    <div style={containerStyle}>
      <h2 style={{ textAlign: 'center', marginBottom: 20 }}>Verification History</h2>

      <div style={{ marginBottom: 20, textAlign: 'center' }}>
        <label>Filter by Status: </label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={selectStyle}
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
          <option value="submitted_to_swift">Submitted to SWIFT</option>
        </select>
      </div>

      {verifications.length === 0 ? (
        <p style={{ textAlign: 'center' }}>No verifications found.</p>
      ) : (
        <table style={tableStyle}>
          <thead style={headerStyle}>
            <tr>
              <th style={cellStyle}>Customer</th>
              <th style={cellStyle}>Amount</th>
              <th style={cellStyle}>SWIFT Code</th>
              <th style={cellStyle}>Status</th>
              <th style={cellStyle}>Verified By</th>
              <th style={cellStyle}>Notes</th>
              <th style={cellStyle}>Created At</th>
              <th style={cellStyle}>Verified At</th>
            </tr>
          </thead>
          <tbody>
            {verifications.map((v) => (
              <tr key={v._id}>
                <td style={cellStyle}>
                  {v.payment?.customer?.fullName || 'Unknown'}
                  <br />
                  <small>{v.payment?.customer?.accountNumber}</small>
                </td>
                <td style={cellStyle}>
                  {v.payment?.amount} {v.payment?.currency}
                </td>
                <td style={cellStyle}>{v.swiftCode}</td>
                <td style={cellStyle}>
                  <span style={getStatusBadge(v.verificationStatus)}>
                    {v.verificationStatus}
                  </span>
                </td>
                <td style={cellStyle}>
                  {v.employee?.fullName}
                  <br />
                  <small>{v.employee?.employeeId}</small>
                </td>
                <td style={cellStyle}>{v.verificationNotes || 'N/A'}</td>
                <td style={cellStyle}>{new Date(v.createdAt).toLocaleString()}</td>
                <td style={cellStyle}>
                  {v.verifiedAt ? new Date(v.verifiedAt).toLocaleString() : 'N/A'}
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
    verified: { background: '#d1ecf1', color: '#0c5460' },
    rejected: { background: '#f8d7da', color: '#721c24' },
    submitted_to_swift: { background: '#d4edda', color: '#155724' },
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

export default VerificationHistory;