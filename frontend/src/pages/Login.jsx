import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import banner from '../assets/banner.jpg';

const RESEND_COOLDOWN_SECONDS = 60;

const Login = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  // Handle resize for mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Timer for resend OTP
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
    if (!email) return toast.error('Please enter your email');
    try {
      setLoading(true);
      await axios.post(`${BASE_URL}/api/auth/send-otp`, { email });
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
      await axios.post(`${BASE_URL}/api/auth/resend-otp`, { email });
      toast.success('OTP resent to your email');
      setResendTimer(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return toast.error('Please enter OTP');
    try {
      setLoading(true);
      const res = await axios.post(`${BASE_URL}/api/auth/login`, { email, otp });

      localStorage.setItem('token', res.data.token);
      if (res.data.user) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }

      toast.success('Logged in successfully');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid OTP';
      // Custom message for user not found
      if (msg.includes('User not found')) {
        toast.error('User not found. Please register first.');
      } else {
        toast.error(msg);
      }
      if (msg.toLowerCase().includes('expired')) {
        setOtpSent(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        height: '100vh',
        backgroundColor: '#f8f1e7',
      }}
    >
      {!isMobile && (
        <div style={{ flex: 1 }}>
          <img
            src={banner}
            alt="Login Visual"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      )}

      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: isMobile ? '30px 20px' : '0',
          backgroundColor: '#f8f1e7',
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
            Welcome to <span style={{ color: '#004d40' }}>Payment Manager</span>!
          </h2>
          <p style={{ fontSize: '14px', color: '#666' }}>Login with your email via OTP</p>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              marginTop: '15px',
              border: '1px solid #c7b49a',
              borderRadius: '5px',
            }}
            disabled={otpSent}
          />

          {otpSent && (
            <>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  marginTop: '15px',
                  border: '1px solid #c7b49a',
                  borderRadius: '5px',
                }}
              />
              <button
                disabled={loading || resendTimer > 0}
                onClick={handleResendOtp}
                style={{
                  marginTop: '10px',
                  backgroundColor: resendTimer > 0 ? '#ccc' : '#004d40',
                  color: 'white',
                  padding: '10px',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: resendTimer > 0 ? 'not-allowed' : 'pointer',
                  width: '100%',
                }}
              >
                {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
              </button>
            </>
          )}

          <button
            onClick={!otpSent ? handleSendOtp : handleVerifyOtp}
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
            {loading ? (otpSent ? 'Verifying...' : 'Sending...') : otpSent ? 'Verify & Login' : 'Send OTP'}
          </button>

          <p style={{ marginTop: '15px', fontSize: '14px' }}>
            Don't have an account?{' '}
            <span
              style={{ color: '#004d40', cursor: 'pointer', textDecoration: 'underline' }}
              onClick={() => navigate('/register')}
            >
              Register now
            </span>
          </p>
        </div>
      </div>

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};

export default Login;
