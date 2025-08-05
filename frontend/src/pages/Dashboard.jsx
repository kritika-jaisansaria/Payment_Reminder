import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PaymentRow from '../components/PaymentRow';
import PaymentModal from '../components/PaymentModal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';

const Dashboard = () => {
  const [payments, setPayments] = useState([]);
  const [filterName, setFilterName] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [sortKey, setSortKey] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://payment-dashboard-nc3q.onrender.com';

  // Redirect to login if not logged in
  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };
    if (showUserMenu) {
      window.addEventListener('click', handleClickOutside);
    }
    return () => window.removeEventListener('click', handleClickOutside);
  }, [showUserMenu]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      let query = `?page=${page}&limit=10`;
      if (filterStatus) query += `&status=${filterStatus}`;
      if (filterCategory) query += `&category=${filterCategory}`;

      const res = await axios.get(`${BASE_URL}/api/payments${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let data = Array.isArray(res.data) ? res.data : res.data.payments || [];

      if (filterName.trim()) {
        data = data.filter((p) =>
          p.paymentName.toLowerCase().includes(filterName.toLowerCase())
        );
      }

      if (sortKey) {
        data.sort((a, b) => {
          let valA = a[sortKey];
          let valB = b[sortKey];
          if (sortKey === 'deadline') {
            valA = new Date(valA);
            valB = new Date(valB);
          }
          if (sortOrder === 'asc') return valA > valB ? 1 : valA < valB ? -1 : 0;
          else return valA < valB ? 1 : valA > valB ? -1 : 0;
        });
      }

      setPayments(data);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      toast.error('Error fetching payments');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filterCategory, filterStatus]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const openModal = (payment = null) => {
    setEditingPayment(payment);
    setShowModal(true);
  };
  const closeModal = () => {
    setEditingPayment(null);
    setShowModal(false);
  };
  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };
  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    setTimeout(() => navigate('/login'), 1000);
  };

  const thStyle = {
    padding: '14px 10px',
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: isMobile ? '0.85rem' : '1rem',
    borderBottom: '2px solid #4CAF50',
    textAlign: 'center',
  };

  return (
    <div
      style={{
        padding: isMobile ? '15px' : '30px 25px',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: '#333',
      }}
    >
      <ToastContainer />
      <header
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          gap: '10px',
          marginBottom: '20px',
        }}
      >
        <h2
          style={{
            fontWeight: '700',
            fontSize: isMobile ? '1.4rem' : '1.8rem',
            color: '#4CAF50',
          }}
        >
          💰 Your Payments
        </h2>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => openModal()}
            style={{
              backgroundColor: '#4CAF50',
              color: '#fff',
              padding: isMobile ? '10px 14px' : '12px 18px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              width: isMobile ? '100%' : 'auto',
            }}
          >
            + Add Payment
          </button>

          {/* User Profile Icon & Dropdown */}
          <div className="user-menu-container" style={{ position: 'relative' }}>
            <FaUserCircle
              size={28}
              style={{ cursor: 'pointer', color: '#4CAF50' }}
              onClick={() => setShowUserMenu(!showUserMenu)}
            />

            {showUserMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: '35px',
                  right: 0,
                  background: 'white',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  zIndex: 1000,
                  width: '140px',
                  fontSize: '14px',
                }}
              >
                <div
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/profile');
                  }}
                  style={{
                    padding: '10px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #eee',
                  }}
                >
                  My Account
                </div>
                <div
                  onClick={() => {
                    setShowUserMenu(false);
                    handleLogout();
                  }}
                  style={{ padding: '10px', cursor: 'pointer', color: 'red' }}
                >
                  Logout
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Filters */}
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        <input
          type="text"
          placeholder="Search by name"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          style={{
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            width: isMobile ? '100%' : '220px',
          }}
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            width: isMobile ? '100%' : '160px',
          }}
        >
          <option value="">All Categories</option>
          <option value="Rent">Rent</option>
          <option value="Utilities">Utilities</option>
          <option value="Groceries">Groceries</option>
          <option value="Subscriptions">Subscriptions</option>
          <option value="Others">Others</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            width: isMobile ? '100%' : '160px',
          }}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', fontSize: '1.2rem' }}>Loading...</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              minWidth: '650px',
              marginBottom: '20px',
            }}
          >
            {/* Hide header on mobile */}
            <thead style={{ display: isMobile ? 'none' : 'table-header-group' }}>
              <tr style={{ backgroundColor: '#eaf6ea' }}>
                <th style={thStyle}>Payment Name</th>
                <th style={{ ...thStyle, cursor: 'pointer' }} onClick={() => handleSort('amount')}>
                  Amount {sortKey === 'amount' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th style={thStyle}>Category</th>
                <th style={{ ...thStyle, cursor: 'pointer' }} onClick={() => handleSort('deadline')}>
                  Deadline {sortKey === 'deadline' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                    No payments found.
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <PaymentRow
                    key={payment._id}
                    payment={payment}
                    fetchPayments={fetchPayments}
                    openModal={openModal}
                    isMobile={isMobile}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <button
          onClick={handlePrevPage}
          disabled={page === 1}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            backgroundColor: page === 1 ? '#eee' : '#fff',
            cursor: page === 1 ? 'not-allowed' : 'pointer',
          }}
        >
          Prev
        </button>
        <span>
          Page <strong>{page}</strong> of <strong>{totalPages}</strong>
        </span>
        <button
          onClick={handleNextPage}
          disabled={page === totalPages}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            backgroundColor: page === totalPages ? '#eee' : '#fff',
            cursor: page === totalPages ? 'not-allowed' : 'pointer',
          }}
        >
          Next
        </button>
      </div>

      {showModal && (
        <PaymentModal onClose={closeModal} fetchPayments={fetchPayments} editingPayment={editingPayment} />
      )}
    </div>
  );
};

export default Dashboard;
