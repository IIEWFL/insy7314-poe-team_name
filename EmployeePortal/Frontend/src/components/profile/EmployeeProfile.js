import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const EmployeeProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE =
    process.env.REACT_APP_API_BASE_URL ||
    (window.location.protocol === 'https:'
      ? 'https://localhost:8001'
      : 'http://localhost:8001');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('employeeToken');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch(`${API_BASE}/api/employee/employees/me`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Failed to fetch profile');
        }

        const data = await response.json();
        setProfile(data.employeeProfile);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [API_BASE, navigate]);

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: 40 }}>Loading profile...</div>;
  }

  if (error) {
    return <div style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>{error}</div>;
  }

  return (
    <div style={containerStyle}>
      <h2 style={{ textAlign: 'center', marginBottom: 20 }}>My Profile</h2>

      {profile && (
        <div style={profileCardStyle}>
          <div style={profileRowStyle}>
            <strong>Full Name:</strong>
            <span>{profile.fullName}</span>
          </div>
          <div style={profileRowStyle}>
            <strong>Employee ID:</strong>
            <span>{profile.employeeId}</span>
          </div>
          <div style={profileRowStyle}>
            <strong>Email:</strong>
            <span>{profile.email}</span>
          </div>
          <div style={profileRowStyle}>
            <strong>Department:</strong>
            <span>{profile.department}</span>
          </div>
          <div style={profileRowStyle}>
            <strong>Role:</strong>
            <span style={getRoleBadge(profile.role)}>{profile.role}</span>
          </div>
          <div style={profileRowStyle}>
            <strong>Status:</strong>
            <span style={profile.isActive ? activeStatusStyle : inactiveStatusStyle}>
              {profile.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div style={profileRowStyle}>
            <strong>Hire Date:</strong>
            <span>{new Date(profile.hireDate).toLocaleDateString()}</span>
          </div>
        </div>
      )}
    </div>
  );
};

const getRoleBadge = (role) => {
  const baseStyle = {
    padding: '4px 12px',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 'bold',
  };

  const colors = {
    verifier: { background: '#d1ecf1', color: '#0c5460' },
    admin: { background: '#f8d7da', color: '#721c24' },
    manager: { background: '#d4edda', color: '#155724' },
  };

  return { ...baseStyle, ...(colors[role] || colors.verifier) };
};

// Styles
const containerStyle = {
  maxWidth: '800px',
  margin: '30px auto',
  background: '#f9f9f9',
  padding: '20px',
  borderRadius: '12px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
};

const profileCardStyle = {
  background: 'white',
  padding: '20px',
  borderRadius: '8px',
};

const profileRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '15px 0',
  borderBottom: '1px solid #e0e0e0',
};

const activeStatusStyle = {
  color: '#155724',
  background: '#d4edda',
  padding: '4px 12px',
  borderRadius: '4px',
  fontWeight: 'bold',
};

const inactiveStatusStyle = {
  color: '#721c24',
  background: '#f8d7da',
  padding: '4px 12px',
  borderRadius: '4px',
  fontWeight: 'bold',
};

export default EmployeeProfile;