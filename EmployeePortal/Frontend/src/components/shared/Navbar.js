import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Navbar = ({ isLoggedIn, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('employeeToken');
    localStorage.removeItem('employeeProfile');
    if (onLogout) onLogout();
    navigate('/login');
  };

  return (
    <nav style={navStyle}>
      <div style={containerStyle}>
        <Link to="/dashboard" style={logoStyle}>
          Employee Portal
        </Link>

        {isLoggedIn ? (
          <div style={linksContainerStyle}>
            <Link to="/dashboard" style={linkStyle}>Dashboard</Link>
            <Link to="/payments/pending" style={linkStyle}>Pending Payments</Link>
            <Link to="/payments/all" style={linkStyle}>All Payments</Link>
            <Link to="/verification/submit" style={linkStyle}>Submit to SWIFT</Link>
            <Link to="/verification/history" style={linkStyle}>History</Link>
            <Link to="/profile" style={linkStyle}>Profile</Link>
            <button onClick={handleLogout} style={logoutButtonStyle}>
              Logout
            </button>
          </div>
        ) : (
          <Link to="/login" style={linkStyle}>Login</Link>
        )}
      </div>
    </nav>
  );
};

// Styles
const navStyle = {
  background: '#1976d2',
  padding: '15px 0',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
};

const containerStyle = {
  maxWidth: '1400px',
  margin: '0 auto',
  padding: '0 20px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const logoStyle = {
  color: 'white',
  fontSize: '20px',
  fontWeight: 'bold',
  textDecoration: 'none',
};

const linksContainerStyle = {
  display: 'flex',
  gap: '20px',
  alignItems: 'center',
};

const linkStyle = {
  color: 'white',
  textDecoration: 'none',
  fontSize: '14px',
  transition: 'opacity 0.2s',
};

const logoutButtonStyle = {
  background: '#f44336',
  color: 'white',
  border: 'none',
  padding: '8px 16px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px',
};

export default Navbar;