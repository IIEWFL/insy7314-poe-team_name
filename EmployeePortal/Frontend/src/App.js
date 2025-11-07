import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Components
import Navbar from './components/shared/Navbar';
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';
import PendingPayments from './components/payments/PendingPayments';
import AllPayments from './components/payments/AllPayments';
import VerifyPayment from './components/verification/VerifyPayment';
import SubmitToSwift from './components/verification/SubmitToSwift';
import VerificationHistory from './components/verification/VerificationHistory';
import EmployeeProfile from './components/profile/EmployeeProfile';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('employeeToken');
    setIsLoggedIn(!!token);
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <Router>
      <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
        <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} />
        
        <Routes>
          <Route 
            path="/login" 
            element={
              isLoggedIn ? <Navigate to="/dashboard" /> : <Login onLoginSuccess={handleLoginSuccess} />
            } 
          />
          
          <Route 
            path="/dashboard" 
            element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />} 
          />
          
          <Route 
            path="/payments/pending" 
            element={isLoggedIn ? <PendingPayments /> : <Navigate to="/login" />} 
          />
          
          <Route 
            path="/payments/all" 
            element={isLoggedIn ? <AllPayments /> : <Navigate to="/login" />} 
          />
          
          <Route 
            path="/verification/verify/:paymentId" 
            element={isLoggedIn ? <VerifyPayment /> : <Navigate to="/login" />} 
          />
          
          <Route 
            path="/verification/submit" 
            element={isLoggedIn ? <SubmitToSwift /> : <Navigate to="/login" />} 
          />
          
          <Route 
            path="/verification/history" 
            element={isLoggedIn ? <VerificationHistory /> : <Navigate to="/login" />} 
          />
          
          <Route 
            path="/profile" 
            element={isLoggedIn ? <EmployeeProfile /> : <Navigate to="/login" />} 
          />
          
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;