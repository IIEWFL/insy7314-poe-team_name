import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useFormik } from 'formik';
import * as yup from 'yup';

// Validation schema
const validationSchema = yup.object({
  amount: yup
    .number()
    .positive('Amount must be positive')
    .max(999999999.99, 'Amount exceeds maximum allowed value')
    .test('decimal', 'Amount can have maximum 2 decimal places', (value) => {
      if (value) return /^\d+(\.\d{1,2})?$/.test(value.toString());
      return true;
    })
    .required('Amount is required'),
  currency: yup
    .string()
    .matches(/^[A-Z]{3}$/, 'Currency must be a 3-letter uppercase code')
    .required('Currency is required'),
  provider: yup
    .string()
    .matches(/^[a-zA-Z0-9]{2,50}$/, 'Provider must be alphanumeric (2–50 characters)')
    .required('Provider is required'),
  recipientAccount: yup
    .string()
    .matches(/^[a-zA-Z0-9\\-_]{6,32}$/, 'Invalid recipient account format')
    .required('Recipient account is required'),
});

function Create() {
  const navigate = useNavigate();

  // Create secure Axios instance
  const api = axios.create({
    baseURL: 'https://localhost:8000/api',
    withCredentials: true,
  });

  const formik = useFormik({
    initialValues: {
      amount: '',
      currency: 'USD',
      provider: '',
      recipientAccount: '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      try {
        const token = localStorage.getItem('token');
        const response = await api.post(
          '/customerPayments/create',
          values,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log('Payment created successfully:', response.data);
        navigate('/payment/success');
      } catch (err) {
        if (err.response?.data?.error) {
          setFieldError('submit', err.response.data.error);
        } else {
          setFieldError('submit', 'Failed to create payment. Please try again.');
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  const currencies = ['USD', 'EUR', 'GBP', 'ZAR', 'JPY', 'AUD', 'CAD', 'INR'];

  return (
    <div style={containerStyle}>
      <h1>Create Payment</h1>
      <form onSubmit={formik.handleSubmit} style={formStyle}>
        {/* Error box */}
        {formik.errors.submit && <div style={errorBoxStyle}>{formik.errors.submit}</div>}

        {/* Amount */}
        <div style={inputContainerStyle}>
          <label>Amount:</label>
          <input
            type="number"
            step="0.01"
            name="amount"
            value={formik.values.amount}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            style={inputStyle}
          />
          {formik.touched.amount && formik.errors.amount && (
            <div style={errorStyle}>{formik.errors.amount}</div>
          )}
        </div>

        {/* Currency */}
        <div style={inputContainerStyle}>
          <label>Currency:</label>
          <select
            name="currency"
            value={formik.values.currency}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            style={inputStyle}
          >
            {currencies.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {formik.touched.currency && formik.errors.currency && (
            <div style={errorStyle}>{formik.errors.currency}</div>
          )}
        </div>

        {/* Provider */}
        <div style={inputContainerStyle}>
          <label>Provider:</label>
          <input
            type="text"
            name="provider"
            value={formik.values.provider}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            style={inputStyle}
          />
          {formik.touched.provider && formik.errors.provider && (
            <div style={errorStyle}>{formik.errors.provider}</div>
          )}
        </div>

        {/* Recipient Account */}
        <div style={inputContainerStyle}>
          <label>Recipient Account:</label>
          <input
            type="text"
            name="recipientAccount"
            value={formik.values.recipientAccount}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            style={inputStyle}
          />
          {formik.touched.recipientAccount && formik.errors.recipientAccount && (
            <div style={errorStyle}>{formik.errors.recipientAccount}</div>
          )}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={formik.isSubmitting}
          style={buttonStyle}
        >
          {formik.isSubmitting ? 'Creating Payment...' : 'Create Payment'}
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

export default Create;