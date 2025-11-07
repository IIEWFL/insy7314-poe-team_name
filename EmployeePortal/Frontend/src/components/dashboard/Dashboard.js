import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    pendingCount: 0,
    verifiedCount: 0,
    rejectedCount: 0,
    submittedCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [employeeProfile, setEmployeeProfile] = useState(null);

  const API_BASE =
    process.env.REACT_APP_API_BASE_URL ||
    (window.location.protocol === 'https:'
      ? 'https://localhost:8001'
      : 'http://localhost:8001');

  useEffect(() => {
    const profile = localStorage.getItem('employeeProfile');
    if (profile) {
      setEmployeeProfile(JSON.parse(profile));
    }

    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('employeeToken');
        if (!token) {
          navigate('/login');
          return;
        }

        // Fetch verifications with different statuses
        const [pending, verified, rejected, submitted] = await Promise.all([
          fetch(`${API_BASE}/api/employee/verifications/all?status=pending`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/api/employee/verifications/all?status=verified`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/api/employee/verifications/all?status=rejected`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/api/employee/verifications/all?status=submitted_to_swift`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const pendingData = await pending.json();
        const verifiedData = await verified.json();
        const rejectedData = await rejected.json();
        const submittedData = await submitted.json();

        setStats({
          pendingCount: pendingData.count || 0,
          verifiedCount: verifiedData.count || 0,
          rejectedCount: rejectedData.count || 0,
          submittedCount: submittedData.count || 0,
        });
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [API_BASE, navigate]);

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: 40 }}>Loading dashboard...</div>;
  }

  return (
    <div style={containerStyle}>
      <h1>Employee Dashboard</h1>
      
      {employeeProfile && (
        <div style={profileCardStyle}>
          <h3>Welcome, {employeeProfile.fullName}!</h3>
          <p>Employee ID: {employeeProfile.employeeId}</p>
          <p>Department: {employeeProfile.department}</p>
          <p>Role: {employeeProfile.role}</p>
        </div>
      )}

      <div style={statsContainerStyle}>
        <div style={statCardStyle}>
          <h2>{stats.pendingCount}</h2>
          <p>Pending Verifications</p>
          <button onClick={() => navigate('/payments/pending')} style={buttonStyle}>
            View Pending
          </button>
        </div>

        <div style={statCardStyle}>
          <h2>{stats.verifiedCount}</h2>
          <p>Verified (Ready for SWIFT)</p>
          <button onClick={() => navigate('/verification/submit')} style={buttonStyle}>
            Submit to SWIFT
          </button>
        </div>

        <div style={statCardStyle}>
          <h2>{stats.rejectedCount}</h2>
          <p>Rejected Payments</p>
        </div>

        <div style={statCardStyle}>
          <h2>{stats.submittedCount}</h2>
          <p>Submitted to SWIFT</p>
        </div>
      </div>

      <div style={quickActionsStyle}>
        <h3>Quick Actions</h3>
        <button onClick={() => navigate('/payments/all')} style={actionButtonStyle}>
          View All Payments
        </button>
        <button onClick={() => navigate('/verification/history')} style={actionButtonStyle}>
          Verification History
        </button>
      </div>
    </div>
  );
};

// Styles
const containerStyle = {
  maxWidth: '1200px',
  margin: '30px auto',
  padding: '20px',
};

const profileCardStyle = {
  background: '#f0f7ff',
  padding: '20px',
  borderRadius: '8px',
  marginBottom: '30px',
  border: '1px solid #1976d2',
};

const statsContainerStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '20px',
  marginBottom: '30px',
};

const statCardStyle = {
  background: 'white',
  padding: '20px',
  borderRadius: '8px',
  textAlign: 'center',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  border: '1px solid #e0e0e0',
};

const buttonStyle = {
  padding: '8px 16px',
  background: '#1976d2',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 14,
  marginTop: 10,
};

const quickActionsStyle = {
  background: 'white',
  padding: '20px',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
};

const actionButtonStyle = {
  padding: '10px 20px',
  background: '#1976d2',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 14,
  marginRight: 10,
  marginTop: 10,
};

export default Dashboard;