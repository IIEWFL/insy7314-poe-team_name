import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SubmitToSwift = () => {
  const navigate = useNavigate();
  const [verifications, setVerifications] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const API_BASE =
    process.env.REACT_APP_API_BASE_URL ||
    (window.location.protocol === 'https:'
      ? 'https://localhost:8001'
      : 'http://localhost:8001');

  useEffect(() => {
    const fetchVerifiedPayments = async () => {
      try {
        const token = localStorage.getItem('employeeToken');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch(`${API_BASE}/api/employee/verifications/verified-for-swift`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Failed to fetch verified payments');
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

    fetchVerifiedPayments();
  }, [API_BASE, navigate]);

  const handleCheckboxChange = (verificationId) => {
    setSelectedIds((prev) => {
      if (prev.includes(verificationId)) {
        return prev.filter((id) => id !== verificationId);
      } else {
        return [...prev, verificationId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.length === verifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(verifications.map((v) => v._id));
    }
  };

  const handleSubmitToSwift = async () => {
    if (selectedIds.length === 0) {
      alert('Please select at least one payment to submit');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to submit ${selectedIds.length} payment(s) to SWIFT? This action cannot be undone.`
    );

    if (!confirmed) return;

    setSubmitting(true);

    try {
      const token = localStorage.getItem('employeeToken');

      const response = await fetch(`${API_BASE}/api/employee/verifications/submit-to-swift`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          verificationIds: selectedIds,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to submit to SWIFT');
      }

      const data = await response.json();
      alert(data.message);
      
      // Refresh the list
      setVerifications(verifications.filter((v) => !selectedIds.includes(v._id)));
      setSelectedIds([]);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: 40 }}>Loading verified payments...</div>;
  }

  if (error) {
    return <div style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>{error}</div>;
  }

  return (
    <div style={containerStyle}>
      <h2 style={{ textAlign: 'center', marginBottom: 20 }}>Submit to SWIFT</h2>

      {verifications.length === 0 ? (
        <p style={{ textAlign: 'center' }}>No verified payments ready for SWIFT submission.</p>
      ) : (
        <>
          <div style={controlsStyle}>
            <button onClick={handleSelectAll} style={selectAllButtonStyle}>
              {selectedIds.length === verifications.length ? 'Deselect All' : 'Select All'}
            </button>
            <span style={{ marginLeft: 20 }}>
              Selected: {selectedIds.length} / {verifications.length}
            </span>
          </div>

          <table style={tableStyle}>
            <thead style={headerStyle}>
              <tr>
                <th style={cellStyle}>Select</th>
                <th style={cellStyle}>Customer</th>
                <th style={cellStyle}>Amount</th>
                <th style={cellStyle}>Currency</th>
                <th style={cellStyle}>Recipient Account</th>
                <th style={cellStyle}>SWIFT Code</th>
                <th style={cellStyle}>Verified By</th>
                <th style={cellStyle}>Verified At</th>
              </tr>
            </thead>
            <tbody>
              {verifications.map((v) => (
                <tr key={v._id}>
                  <td style={cellStyle}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(v._id)}
                      onChange={() => handleCheckboxChange(v._id)}
                    />
                  </td>
                  <td style={cellStyle}>
                    {v.payment?.customer?.fullName || 'Unknown'}
                    <br />
                    <small>{v.payment?.customer?.accountNumber}</small>
                  </td>
                  <td style={cellStyle}>{v.payment?.amount}</td>
                  <td style={cellStyle}>{v.payment?.currency}</td>
                  <td style={cellStyle}>{v.payment?.recipientAccount}</td>
                  <td style={cellStyle}>{v.swiftCode}</td>
                  <td style={cellStyle}>
                    {v.employee?.fullName}
                    <br />
                    <small>{v.employee?.employeeId}</small>
                  </td>
                  <td style={cellStyle}>{new Date(v.verifiedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={submitContainerStyle}>
            <button
              onClick={handleSubmitToSwift}
              disabled={submitting || selectedIds.length === 0}
              style={submitButtonStyle}
            >
              {submitting ? 'Submitting to SWIFT...' : `Submit ${selectedIds.length} Payment(s) to SWIFT`}
            </button>
          </div>
        </>
      )}
    </div>
  );
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

const controlsStyle = {
  marginBottom: 20,
  display: 'flex',
  alignItems: 'center',
};

const selectAllButtonStyle = {
  padding: '8px 16px',
  background: '#1976d2',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 14,
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

const submitContainerStyle = {
  marginTop: 20,
  textAlign: 'center',
};

const submitButtonStyle = {
  padding: '12px 24px',
  background: '#4caf50',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 16,
  fontWeight: 'bold',
};

export default SubmitToSwift;