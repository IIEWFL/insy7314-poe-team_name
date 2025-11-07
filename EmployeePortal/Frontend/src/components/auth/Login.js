import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';

const validationSchema = yup.object({
  employeeId: yup
    .string()
    .matches(/^EMP\d{6}$/, 'Employee ID must be in format EMP followed by 6 digits')
    .required('Employee ID is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
});

function Login({ onLoginSuccess }) {
  const navigate = useNavigate();

  const API_BASE =
    process.env.REACT_APP_API_BASE_URL ||
    (window.location.protocol === 'https:'
      ? 'https://localhost:8001'
      : 'http://localhost:8001');

  const formik = useFormik({
    initialValues: {
      employeeId: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      try {
        const response = await fetch(`${API_BASE}/api/employee/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Login failed');
        }

        const data = await response.json();
        localStorage.setItem('employeeToken', data.token);
        localStorage.setItem('employeeProfile', JSON.stringify(data.employeeProfile));
        
        if (onLoginSuccess) onLoginSuccess();
        navigate('/dashboard');
      } catch (err) {
        setFieldError('submit', err.message);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div style={containerStyle}>
      <h1>Employee Portal Login</h1>
      <form onSubmit={formik.handleSubmit} style={formStyle}>
        {formik.errors.submit && <div style={errorBoxStyle}>{formik.errors.submit}</div>}

        <div style={inputContainerStyle}>
          <label>Employee ID:</label>
          <input
            type="text"
            name="employeeId"
            placeholder="EMP123456"
            value={formik.values.employeeId}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            style={inputStyle}
          />
          {formik.touched.employeeId && formik.errors.employeeId && (
            <div style={errorStyle}>{formik.errors.employeeId}</div>
          )}
        </div>

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

        <button type="submit" disabled={formik.isSubmitting} style={buttonStyle}>
          {formik.isSubmitting ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}

// Styles
const containerStyle = {
  maxWidth: 420,
  margin: '40px auto',
  padding: 24,
  border: '1px solid #e0e0e0',
  borderRadius: 8,
  boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
  backgroundColor: '#fff',
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 14,
};

const inputContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
};

const inputStyle = {
  padding: '10px',
  fontSize: 15,
  borderRadius: 4,
  border: '1px solid #ccc',
  marginTop: 6,
};

const buttonStyle = {
  padding: '10px 12px',
  background: '#1976d2',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 15,
  transition: 'background 0.2s ease-in-out',
};

const errorStyle = {
  color: '#b00020',
  fontSize: 12,
  marginTop: 6,
};

const errorBoxStyle = {
  background: '#fff2f0',
  color: '#b00020',
  padding: 10,
  borderRadius: 6,
  marginBottom: 12,
};

export default Login;