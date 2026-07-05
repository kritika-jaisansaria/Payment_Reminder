import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const PaymentRow = ({ payment, fetchPayments, openModal, isMobile }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const token = localStorage.getItem('token');
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

  const handleDelete = async () => {
    try {
      await axios.delete(`${BASE_URL}/api/payments/${payment._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Payment deleted successfully');
      fetchPayments();
    } catch (err) {
      toast.error('Delete failed');
      console.error('Delete failed', err);
    } finally {
      setConfirmDelete(false);
    }
  };

  // Base styles
  const trStyle = {
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: 'none',
    marginBottom: '16px',
    color: '#333',
    fontSize: '0.95rem',
    userSelect: 'none',
    cursor: 'default',
    display: isMobile ? 'block' : 'table-row',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
     border: 'none',             // 🔑 Remove default row borders
  outline: 'none', 
  overflow: 'hidden',

  };

  const handleMouseEnter = (e) => {
    if (!isMobile) {
      e.currentTarget.style.transform = 'scale(1.02)';
      e.currentTarget.style.cursor = 'pointer';
    }
  };
  const handleMouseLeave = (e) => {
    if (!isMobile) {
      e.currentTarget.style.transform = 'scale(1)';
      e.currentTarget.style.cursor = 'default';
    }
  };

  const tdStyleBase = {
    padding: '16px 14px',
    verticalAlign: 'middle',
    textAlign: 'center',
    fontSize: '0.92rem',
    fontWeight: '500',
  };

  const tdMobileStyle = {
    display: 'flex',
    flexDirection: 'column',
    padding: '12px 14px',
    borderBottom: '1px solid #eee',
  };

  const labelStyle = {
    fontWeight: '700',
    fontSize: '0.75rem',
    color: '#4CAF50',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
  };

  const valueStyle = {
    fontWeight: '500',
    color: '#222',
    fontSize: '0.95rem',
  };

  const statusColors = {
    paid: { bg: '#e0f7ec', color: '#1a7f5a' },
    pending: { bg: '#fff8e1', color: '#b08500' },
    overdue: { bg: '#fdecea', color: '#b00020' },
    cancelled: { bg: '#f0f0f0', color: '#666' },
  };

  const statusStyle = {
    padding: '7px 14px',
    borderRadius: '18px',
    backgroundColor: statusColors[payment.status]?.bg || '#f0f0f0',
    color: statusColors[payment.status]?.color || '#666',
    fontWeight: '700',
    textTransform: 'capitalize',
    fontSize: '0.88rem',
    display: 'inline-block',
    minWidth: '80px',
    textAlign: 'center',
    boxShadow: `0 1px 4px ${statusColors[payment.status]?.color}33`,
    userSelect: 'none',
  };

  const buttonBase = {
    padding: isMobile ? '8px 14px' : '10px 20px',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: isMobile ? '0.85rem' : '0.92rem',
    color: '#fff',
    flex: 1,
    minWidth: '90px',
    transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
    userSelect: 'none',
  };

  // Updated hover handler to reset to original color on mouse leave
  const handleBtnHover = (e, isEnter, hoverColor, shadow, originalColor) => {
    if (isEnter) {
      e.currentTarget.style.backgroundColor = hoverColor;
      e.currentTarget.style.boxShadow = shadow;
    } else {
      e.currentTarget.style.backgroundColor = originalColor;
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
    }
  };

  const modalOverlayStyle = {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1100,
  };

  const modalStyle = {
    backgroundColor: '#fff',
    padding: isMobile ? '22px 24px' : '32px 40px',
    borderRadius: '14px',
    width: isMobile ? '90%' : '350px',
    maxWidth: '95%',
    boxShadow: '0 10px 28px rgba(0,0,0,0.18)',
    textAlign: 'center',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    userSelect: 'none',
  };

  const modalTextStyle = {
    marginBottom: '24px',
    fontSize: '1.1rem',
    color: '#222',
    fontWeight: '700',
  };

  const modalBtnContainer = {
    display: 'flex',
    justifyContent: 'center',
    gap: '18px',
    flexWrap: 'wrap',
  };

  return (
    <tr
      style={trStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {isMobile ? (
        <>
          <td style={tdMobileStyle}>
            <span style={labelStyle}>Name</span>
            <span style={valueStyle}>{payment.paymentName}</span>
          </td>
          <td style={tdMobileStyle}>
            <span style={labelStyle}>Amount</span>
            <span style={valueStyle}>₹{payment.amount.toLocaleString()}</span>
          </td>
          <td style={tdMobileStyle}>
            <span style={labelStyle}>Category</span>
            <span style={valueStyle}>{payment.category}</span>
          </td>
          <td style={tdMobileStyle}>
            <span style={labelStyle}>Deadline</span>
            <span style={valueStyle}>{new Date(payment.deadline).toLocaleDateString()}</span>
          </td>
          <td style={tdMobileStyle}>
            <span style={labelStyle}>Status</span>
            <span style={statusStyle}>{payment.status}</span>
          </td>
          <td style={{ ...tdMobileStyle, flexDirection: 'row', justifyContent: 'center', gap: '12px' }}>
            <button
              onClick={() => openModal(payment)}
              style={{ ...buttonBase, backgroundColor: '#1976d2' }}
              onMouseEnter={e => handleBtnHover(e, true, '#1565c0', '0 6px 20px rgba(21,101,192,0.4)', '#1976d2')}
              onMouseLeave={e => handleBtnHover(e, false, '', '', '#1976d2')}
              aria-label="Edit Payment"
            >
              Edit
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              style={{ ...buttonBase, backgroundColor: '#d32f2f' }}
              onMouseEnter={e => handleBtnHover(e, true, '#b71c1c', '0 6px 20px rgba(183,28,28,0.4)', '#d32f2f')}
              onMouseLeave={e => handleBtnHover(e, false, '', '', '#d32f2f')}
              aria-label="Delete Payment"
            >
              Delete
            </button>
          </td>
        </>
      ) : (
        <>
          <td style={tdStyleBase}>{payment.paymentName}</td>
          <td style={tdStyleBase}>₹{payment.amount.toLocaleString()}</td>
          <td style={tdStyleBase}>{payment.category}</td>
          <td style={tdStyleBase}>{new Date(payment.deadline).toLocaleDateString()}</td>
          <td style={tdStyleBase}>
            <span style={statusStyle}>{payment.status}</span>
          </td>
          <td style={{ ...tdStyleBase, display: 'flex', justifyContent: 'center', gap: '18px' }}>
            <button
              onClick={() => openModal(payment)}
              style={{ ...buttonBase, backgroundColor: '#1976d2' }}
              onMouseEnter={e => handleBtnHover(e, true, '#1565c0', '0 6px 20px rgba(21,101,192,0.4)', '#1976d2')}
              onMouseLeave={e => handleBtnHover(e, false, '', '', '#1976d2')}
              aria-label="Edit Payment"
            >
              Edit
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              style={{ ...buttonBase, backgroundColor: '#d32f2f' }}
              onMouseEnter={e => handleBtnHover(e, true, '#b71c1c', '0 6px 20px rgba(183,28,28,0.4)', '#d32f2f')}
              onMouseLeave={e => handleBtnHover(e, false, '', '', '#d32f2f')}
              aria-label="Delete Payment"
            >
              Delete
            </button>
          </td>
        </>
      )}

      {confirmDelete && (
        <div style={modalOverlayStyle} onClick={() => setConfirmDelete(false)} role="dialog" aria-modal="true">
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <p style={modalTextStyle}>
              Are you sure you want to delete this payment?
            </p>
            <div style={modalBtnContainer}>
              <button
                onClick={handleDelete}
                style={{ ...buttonBase, backgroundColor: '#d32f2f', minWidth: '110px' }}
                aria-label="Confirm Delete"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                style={{ ...buttonBase, backgroundColor: '#777', minWidth: '110px' }}
                aria-label="Cancel Delete"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </tr>
  );
};

export default PaymentRow;
