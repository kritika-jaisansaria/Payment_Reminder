import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const categories = ['Rent', 'Utilities', 'Groceries', 'Subscriptions', 'Others'];

const PaymentModal = ({ onClose, fetchPayments, editingPayment }) => {
  const [form, setForm] = useState({
    paymentName: '',
    amount: '',
    category: '',
    deadline: '',
    status: 'pending',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const token = localStorage.getItem('token');

  // Base URL from env
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

  useEffect(() => {
    if (editingPayment) {
      setForm({
        paymentName: editingPayment.paymentName,
        amount: editingPayment.amount,
        category: editingPayment.category,
        deadline: editingPayment.deadline.slice(0, 10),
        status: editingPayment.status,
      });
    }
  }, [editingPayment]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validateForm = () => {
    const newErrors = {};
    if (!form.paymentName.trim()) newErrors.paymentName = 'Payment Name is required';
    if (Number(form.amount) <= 0) newErrors.amount = 'Amount must be greater than 0';
    if (!form.category) newErrors.category = 'Category is required';
    if (!form.deadline) {
      newErrors.deadline = 'Deadline is required';
    } else {
      const today = new Date().setHours(0, 0, 0, 0);
      const deadlineDate = new Date(form.deadline).setHours(0, 0, 0, 0);
      if (deadlineDate < today) newErrors.deadline = 'Deadline cannot be in the past';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        ...form,
        amount: Number(form.amount),
        deadline: new Date(form.deadline).toISOString(),
      };

      if (editingPayment) {
        await axios.put(`${BASE_URL}/api/payments/${editingPayment._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Payment updated successfully');
      } else {
        await axios.post(`${BASE_URL}/api/payments`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Payment added successfully');
      }

      fetchPayments();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    padding: isMobile ? '10px' : '0',
  };

  const modalStyle = {
    backgroundColor: '#fff',
    padding: isMobile ? '20px 16px' : '32px',
    borderRadius: '12px',
    width: isMobile ? '100%' : '400px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
    fontFamily: 'Segoe UI, sans-serif',
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    marginTop: '8px',
    border: '1px solid #c5b59a',
    borderRadius: '6px',
    fontSize: '1rem',
    outline: 'none',
  };

  const labelStyle = {
    marginTop: '16px',
    fontWeight: '600',
    fontSize: '0.9rem',
    color: '#333',
    display: 'block',
  };

  const errorStyle = {
    color: 'crimson',
    fontSize: '0.8rem',
    marginTop: '4px',
  };

  const buttonStyle = {
    marginTop: '24px',
    padding: '12px',
    backgroundColor: '#004d40',
    color: '#fff',
    fontWeight: '600',
    border: 'none',
    width: '100%',
    borderRadius: '6px',
    cursor: loading ? 'not-allowed' : 'pointer',
    fontSize: '1rem',
    opacity: loading ? 0.6 : 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  const spinnerStyle = {
    border: '3px solid #f3f3f3',
    borderTop: '3px solid #fff',
    borderRadius: '50%',
    width: '16px',
    height: '16px',
    animation: 'spin 1s linear infinite',
    marginRight: '10px',
  };

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg);}
            100% { transform: rotate(360deg);}
          }
        `}
      </style>
      <ToastContainer />
      <div style={modalOverlayStyle} onClick={onClose}>
        <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
          <h2 style={{ textAlign: 'center', color: '#222', marginBottom: '20px' }}>
            {editingPayment ? 'Edit Payment' : 'Add Payment'}
          </h2>

          <form onSubmit={handleSubmit} noValidate>
            <label style={labelStyle}>Payment Name</label>
            <input
              style={inputStyle}
              type="text"
              name="paymentName"
              placeholder="e.g., Internet Bill"
              value={form.paymentName}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.paymentName && <div style={errorStyle}>{errors.paymentName}</div>}

            <label style={labelStyle}>Amount (₹)</label>
            <input
              style={inputStyle}
              type="number"
              name="amount"
              placeholder="e.g., 1500"
              value={form.amount}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.amount && <div style={errorStyle}>{errors.amount}</div>}

            <label style={labelStyle}>Category</label>
            <select
              style={inputStyle}
              name="category"
              value={form.category}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && <div style={errorStyle}>{errors.category}</div>}

            <label style={labelStyle}>Deadline</label>
            <input
              style={inputStyle}
              type="date"
              name="deadline"
              value={form.deadline}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.deadline && <div style={errorStyle}>{errors.deadline}</div>}

            <label style={labelStyle}>Status</label>
            <select
              style={inputStyle}
              name="status"
              value={form.status}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <button type="submit" style={buttonStyle} disabled={loading}>
              {loading && <span style={spinnerStyle}></span>}
              {loading ? (editingPayment ? 'Updating...' : 'Saving...') : editingPayment ? 'Update Payment' : 'Add Payment'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default PaymentModal;
