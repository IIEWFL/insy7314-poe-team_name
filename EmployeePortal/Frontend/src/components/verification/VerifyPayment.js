import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';

const validationSchema = yup.object({
  swiftCode: yup
    .string()
    .matches(/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/i, 'Invalid SWIFT code format (8 or 11 characters)')
    .required('SWIFT code is required'),
  verificationNotes: yup
    .string()
    .max(500, 'Notes cannot exceed 500 characters')
    .matches(/^[a-zA-Z0-9\s.,!?\-'()]*$/, 'Notes contain invalid characters'),
});

const VerifyPayment = () => {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE =
    process.env.REACT_APP_API_BASE_URL ||
    (window.location.protocol === 'https:'
      ? 'https://localhost:8001'
      : 'http://localhost:8001');

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const token = localStorage.getItem('employeeToken');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch(`${API_BASE}/api/employee/verifications/payments`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch payment');

        const data = await response.json();
        const foundPayment = data.payments.find((p) => p._id === paymentId);
        
        if (!foundPayment) {
          throw new Error('Payment not found');
        }

        setPayment(foundPayment);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPayment();
  }, [API_BASE, paymentId, navigate]);

  const formik = useFormik({
    initialValues: {
      swiftCode: '',
      verificationNotes: '',
      action: 'verify', // 'verify' or 'reject'
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      try {
        const token = localStorage.getItem('employeeToken');

        // Step 1: Create verification record
        const createResponse = await fetch(`${API_BASE}/api/employee/verifications/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            paymentId,
            swiftCode: values.swiftCode.toUpperCase(),
            verificationNotes: values.verificationNotes,
          }),
        });

        if (!createResponse.ok) {
          const errData = await createResponse.json();
          throw new Error(errData.error || 'Failed to create verification');
        }

        const createData = await createResponse.json();
        const verificationId = createData.verification._id;

        // Step 2: Verify or Reject
        if (values.action === 'verify') {
          const verifyResponse = await fetch(
            `${API_BASE}/api/employee/verifications/${verificationId}/verify`,
            {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                verificationNotes: values.verificationNotes,
              }),
            }
          );

          if (!verifyResponse.ok) throw new Error('Failed to verify payment');

          alert('Payment verified successfully!');
          navigate('/verification/submit');
        } else {
          const rejectResponse = await fetch(
            `${API_BASE}/api/employee/verifications/${verificationId}/reject`,
            {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                verificationNotes: values.verificationNotes || 'Rejected by employee',
              }),
            }
          );

          if (!rejectResponse.ok) throw new Error('Failed to reject payment');

          alert('Payment rejected successfully!');
          navigate('/payments/pending');
        }
      } catch (err) {
        setFieldError('submit', err.message);
      } finally {
        setSubmitting(false);
      }
    },
  });

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: 40 }}>Loading payment details...</div>;
  }

  if (error) {
    return <div style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>{error}</div>;
  }

  return (
    <div style={containerStyle}>
      <h2>Verify Payment</h2>

      {payment && (
        <div style={paymentDetailsStyle}>
          <h3>Payment Details</h3>
          <p><strong>Customer:</strong> {payment.customer?.fullName}</p>
          <p><strong>Account Number:</strong> {payment.customer?.accountNumber}</p>
          <p><strong>Email:</strong> {payment.customer?.email}</p>
          <p><strong>Amount:</strong> {payment.amount} {payment.currency}</p>
          <p><strong>Provider:</strong> {payment.provider}</p>
          <p><strong>Recipient Account:</strong> {payment.recipientAccount}</p>
          <p><strong>Status:</strong> {payment.status}</p>
          <p><strong>Timestamp:</strong> {new Date(payment.timestamp).toLocaleString()}</p>
        </div>
      )}

      <form onSubmit={formik.handleSubmit} style={formStyle}>
        {formik.errors.submit && <div style={errorBoxStyle}>{formik.errors.submit}</div>}

        <div style={inputContainerStyle}>
          <label>SWIFT Code:</label>
          <input
            type="text"
            name="swiftCode"
            placeholder="AAAABBCC or AAAABBCCXXX"
            value={formik.values.swiftCode}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            style={inputStyle}
          />
          {formik.touched.swiftCode && formik.errors.swiftCode && (
            <div style={errorStyle}>{formik.errors.swiftCode}</div>
          )}
        </div>

        <div style={inputContainerStyle}>
          <label>Verification Notes (Optional):</label>
          <textarea
            name="verificationNotes"
            rows="4"
            value={formik.values.verificationNotes}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            style={inputStyle}
          />
          {formik.touched.verificationNotes && formik.errors.verificationNotes && (
            <div style={errorStyle}>{formik.errors.verificationNotes}</div>
          )}
        </div>

        <div style={buttonGroupStyle}>
          <button
type="button"
            onClick={() => {
              formik.setFieldValue('action', 'verify');
              formik.handleSubmit();
            }}
            disabled={formik.isSubmitting}
            style={verifyButtonStyle}
          >
            {formik.isSubmitting && formik.values.action === 'verify' ? 'Verifying...' : 'Verify Payment'}
          </button>

          <button
            type="button"
            onClick={() => {
              formik.setFieldValue('action', 'reject');
              formik.handleSubmit();
            }}
            disabled={formik.isSubmitting}
            style={rejectButtonStyle}
          >
            {formik.isSubmitting && formik.values.action === 'reject' ? 'Rejecting...' : 'Reject Payment'}
          </button>
        </div>
      </form>
    </div>
  );
};

// Styles
const containerStyle = {
  maxWidth: 800,
  margin: '30px auto',
  padding: 24,
  border: '1px solid #e0e0e0',
  borderRadius: 8,
  boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
  backgroundColor: '#fff',
};

const paymentDetailsStyle = {
  background: '#f5f5f5',
  padding: 20,
  borderRadius: 8,
  marginBottom: 20,
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

const buttonGroupStyle = {
  display: 'flex',
  gap: 10,
  marginTop: 10,
};

const verifyButtonStyle = {
  padding: '10px 20px',
  background: '#4caf50',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 15,
  flex: 1,
};

const rejectButtonStyle = {
  padding: '10px 20px',
  background: '#f44336',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 15,
  flex: 1,
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

export default VerifyPayment;