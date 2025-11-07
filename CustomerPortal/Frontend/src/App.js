// src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import Signup from './components/auth/Signup';
import Login from './components/auth/Login';
import Create from './components/customerPayment/Create';
import CustomerHistory from './components/customerPayment/CustomerHistory';
import './App.css';

// Navbar component
function Navbar({ isLoggedIn, handleLogout }) {
  return (
    <nav style={navStyle}>
      <div style={{ fontWeight: 'bold' }}>INSY7314</div>
      <div>
        {!isLoggedIn ? (
          <>
            <Link to="/signup" style={linkStyle}>Signup</Link>
            <Link to="/login" style={{ ...linkStyle, marginLeft: 12 }}>Login</Link>
          </>
        ) : (
          <>
            <Link to="/payment/create" style={linkStyle}>Create Payment</Link>
            <Link to="/payment/history" style={{ ...linkStyle, marginLeft: 12 }}>My Payments</Link>
            <button onClick={handleLogout} style={logoutButtonStyle}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}

const navStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 20px',
  background: '#282c34',
  color: '#fff',
};

const linkStyle = {
  color: '#61dafb',
  textDecoration: 'none',
};

const logoutButtonStyle = {
  marginLeft: 12,
  background: 'transparent',
  border: '1px solid #61dafb',
  color: '#61dafb',
  borderRadius: 4,
  padding: '4px 8px',
  cursor: 'pointer',
};

// Wrapper for protecting private routes
function PrivateRoute({ element: Component }) {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) navigate('/login');
  }, [token, navigate]);

  return token ? <Component /> : null;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  // Update login state on mount and token change
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    window.location.href = '/login';
  };

  return (
    <Router>
      <Navbar isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
      <main style={{ padding: 20 }}>
        <Routes>
          <Route path="/signup" element={<Signup />} />
          {/* Pass handler to Login */}
          <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/payment/create" element={<PrivateRoute element={Create} />} />
          <Route path="/payment/history" element={<PrivateRoute element={CustomerHistory} />} />
          <Route path="/" element={<Signup />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
