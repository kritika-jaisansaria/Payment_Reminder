import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import banner from '../assets/banner.jpg';

const RESEND_COOLDOWN_SECONDS = 60;

const useWindowWidth = () => {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return width;
};

const Register = () => {
  const navigate = useNavigate();
  const width = useWindowWidth();
  const isMobile = width < 768;

  const [form, setForm] = useState({ name: '', email: '', otp: '' });
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://payment-dashboard-nc3q.onrender.com';

  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((t) => t - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSendOtp = async () => {
    if (!form.name || !form.email) {
      return toast.error('Please enter name and email');
    }
    try {
      setLoading(true);
      await axios.post(`${BASE_URL}/api/auth/send-otp`, {
        email: form.email,
        name: form.name,
      });
      setOtpSent(true);
      toast.success('OTP sent to your email');
      setResendTimer(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    try {
      setLoading(true);
      await axios.post(`${BASE_URL}/api/auth/resend-otp`, { email: form.email });
      toast.success('OTP resent to your email');
      setResendTimer(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!form.otp) return toast.error('Please enter the OTP');
    try {
      setLoading(true);
      const res = await axios.post(`${BASE_URL}/api/auth/register`, form);
      localStorage.setItem('token', res.data.token);
      toast.success('Registered successfully');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
      if (msg.toLowerCase().includes('expired')) setOtpSent(true);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        minHeight: '100vh',
        backgroundColor: '#f8f1e7',
      }}
    >
      {!isMobile && (
        <div style={{ flex: 1 }}>
          <img
            src={banner}
            alt="Register"
            style={{ width: '100%', height: '100vh', objectFit: 'cover' }}
          />
        </div>
      )}

      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: isMobile ? '40px 20px' : '30px',
        }}
      >
        <div
          style={{
            background: '#fff',
            padding: '30px',
            borderRadius: '10px',
            boxShadow: '0 0 15px rgba(0,0,0,0.1)',
            width: '100%',
            maxWidth: '400px',
            textAlign: 'center',
          }}
        >
          <h2 style={{ marginBottom: '10px', color: '#1d1d1d' }}>
            Create your <span style={{ color: '#004d40' }}>Account</span>
          </h2>
          <p style={{ fontSize: '14px', color: '#666' }}>Register using your email</p>

          <input
            type="text"
            name="name"
            placeholder="Enter your name"
            value={form.name}
            onChange={handleChange}
            disabled={otpSent}
            style={{
              width: '100%',
              padding: '12px',
              marginTop: '15px',
              border: '1px solid #c7b49a',
              borderRadius: '5px',
            }}
          />

          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={handleChange}
            disabled={otpSent}
            style={{
              width: '100%',
              padding: '12px',
              marginTop: '15px',
              border: '1px solid #c7b49a',
              borderRadius: '5px',
            }}
          />

          {otpSent && (
            <>
              <input
                type="text"
                name="otp"
                placeholder="Enter OTP"
                value={form.otp}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  marginTop: '15px',
                  border: '1px solid #c7b49a',
                  borderRadius: '5px',
                }}
              />
              <button
                onClick={handleResendOtp}
                disabled={loading || resendTimer > 0}
                style={{
                  marginTop: '10px',
                  backgroundColor: resendTimer > 0 ? '#ccc' : '#004d40',
                  color: 'white',
                  padding: '10px',
                  border: 'none',
                  borderRadius: '5px',
                  width: '100%',
                  cursor: resendTimer > 0 ? 'not-allowed' : 'pointer',
                }}
              >
                {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
              </button>
            </>
          )}

          <button
            onClick={!otpSent ? handleSendOtp : handleRegister}
            disabled={loading}
            style={{
              marginTop: '20px',
              padding: '12px',
              backgroundColor: '#004d40',
              color: 'white',
              border: 'none',
              width: '100%',
              borderRadius: '5px',
              cursor: 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Processing...' : otpSent ? 'Verify & Register' : 'Send OTP'}
          </button>

          <p style={{ marginTop: '15px', fontSize: '14px' }}>
            Already have an account?{' '}
            <span
              style={{ color: '#004d40', cursor: 'pointer', textDecoration: 'underline' }}
              onClick={() => navigate('/login')}
            >
              Login
            </span>
          </p>
        </div>
      </div>

      {/* ✅ Styled Toast like Login */}
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
    </div>
  );
};

export default Register;
