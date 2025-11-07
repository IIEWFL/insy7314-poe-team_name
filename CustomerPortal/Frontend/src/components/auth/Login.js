import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';

//Create an axios instance with HTTPS
const api = axios.create({
  baseURL: 'https://localhost:8000/api',
  withCredentials: true,
});

// Validation schema matching backend rules
const validationSchema = yup.object({
  fullName: yup
    .string()
    .matches(/^[a-zA-Z\s\-']+$/, 'Invalid name. Only letters, spaces, hyphens, and apostrophes allowed.')
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name cannot exceed 100 characters')
    .required('Full name is required'),

  accountNumber: yup
    .string()
    .matches(/^\d{12}$/, 'Account number must be exactly 12 digits')
    .required('Account number is required'),

  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password cannot exceed 128 characters')
    .matches(/^[a-zA-Z0-9!@#$%^&*()_+\-=]+$/, 'Password contains invalid characters')
    .required('Password is required'),
});

function Login({ onLoginSuccess }) {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      fullName: '',
      accountNumber: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      try {
        const response = await api.post('/auth/login', values);
        localStorage.setItem('token', response.data.token);
        if (onLoginSuccess) onLoginSuccess();
        navigate('/payment/create');
      } catch (err) {
        if (err.response?.data?.error) {
          setFieldError('submit', err.response.data.error);
        } else {
          setFieldError('submit', 'Something went wrong. Please try again.');
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div style={containerStyle}>
      <h1>Login</h1>
      <form onSubmit={formik.handleSubmit} style={formStyle}>
        {/* Backend error */}
        {formik.errors.submit && <div style={errorBoxStyle}>{formik.errors.submit}</div>}

        {/* Full Name */}
        <div style={inputContainerStyle}>
          <label>Full Name:</label>
          <input
            type="text"
            name="fullName"
            value={formik.values.fullName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            style={inputStyle}
          />
          {formik.touched.fullName && formik.errors.fullName && (
            <div style={errorStyle}>{formik.errors.fullName}</div>
          )}
        </div>

        {/* Account Number */}
        <div style={inputContainerStyle}>
          <label>Account Number:</label>
          <input
            type="text"
            name="accountNumber"
            value={formik.values.accountNumber}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            style={inputStyle}
          />
          {formik.touched.accountNumber && formik.errors.accountNumber && (
            <div style={errorStyle}>{formik.errors.accountNumber}</div>
          )}
        </div>

        {/* Password */}
        <div style={inputContainerStyle}>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            style={inputStyle}
          />
          {formik.touched.password && formik.errors.password && (
            <div style={errorStyle}>{formik.errors.password}</div>
          )}
        </div>

        {/* Submit */}
        <button type="submit" disabled={formik.isSubmitting} style={buttonStyle}>
          {formik.isSubmitting ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}

// Updated Styles to match Dashboard theme
const containerStyle = {
  maxWidth: '420px',
  margin: '40px auto',
  padding: '30px',
  background: 'white',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  border: '1px solid #e0e0e0',
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
};

const inputContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
};

const inputStyle = {
  padding: '12px',
  fontSize: '15px',
  borderRadius: '4px',
  border: '1px solid #ccc',
  marginTop: '6px',
  transition: 'border 0.2s ease-in-out',
};

const buttonStyle = {
  padding: '12px 20px',
  background: '#1976d2',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '15px',
  fontWeight: '500',
  transition: 'background 0.2s ease-in-out',
  marginTop: '10px',
};

const buttonHoverStyle = {
  background: '#1565c0',
};

const errorStyle = {
  color: '#b00020',
  fontSize: '12px',
  marginTop: '6px',
};

const errorBoxStyle = {
  background: '#fff2f0',
  color: '#b00020',
  padding: '12px',
  borderRadius: '6px',
  marginBottom: '16px',
  border: '1px solid #ffcdd2',
};

export default Login;