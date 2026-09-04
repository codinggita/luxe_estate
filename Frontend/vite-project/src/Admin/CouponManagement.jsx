import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config/api';
import './Admin.css';

const CouponManagement = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderAmount: '',
    maxDiscountAmount: '',
    usageLimit: '',
    startDate: '',
    expiryDate: '',
    isActive: true
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    fetchCoupons();
  }, [navigate, currentPage, statusFilter, searchTerm]);

  const fetchCoupons = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10
      });
      
      if (statusFilter) params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await axios.get(`${API_URL}/admin/coupons?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCoupons(response.data.coupons);
      setPagination(response.data.pagination);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminInfo');
        navigate('/admin/login');
      } else {
        setError('Failed to fetch coupons');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('adminToken');
      
      if (editingCoupon) {
        await axios.put(
          `${API_URL}/admin/coupons/${editingCoupon._id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${API_URL}/admin/coupons`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setShowAddForm(false);
      setEditingCoupon(null);
      setFormData({
        code: '',
        name: '',
        description: '',
        discountType: 'percentage',
        discountValue: '',
        minOrderAmount: '',
        maxDiscountAmount: '',
        usageLimit: '',
        startDate: '',
        expiryDate: '',
        isActive: true
      });
      fetchCoupons();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save coupon');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount,
      maxDiscountAmount: coupon.maxDiscountAmount,
      usageLimit: coupon.usageLimit,
      startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().split('T')[0] : '',
      expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : '',
      isActive: coupon.isActive
    });
    setShowAddForm(true);
  };

  const handleDelete = async (coupon) => {
    if (!window.confirm(`Are you sure you want to delete coupon "${coupon.code}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(
        `${API_URL}/admin/coupons/${coupon._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCoupons();
    } catch (err) {
      setError('Failed to delete coupon');
    }
  };

  const toggleCouponStatus = async (coupon) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(
        `${API_URL}/admin/coupons/${coupon._id}`,
        { isActive: !coupon.isActive },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCoupons();
    } catch (err) {
      setError('Failed to update coupon status');
    }
  };

  const getCouponStatus = (coupon) => {
    if (!coupon.isActive) return 'inactive';
    if (new Date(coupon.expiryDate) < new Date()) return 'expired';
    return 'active';
  };

  const getStatusColor = (status) => {
    const colors = {
      active: '#10b981',
      expired: '#ef4444',
      inactive: '#6b7280'
    };
    return colors[status] || '#6b7280';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return <div className="admin-loading">Loading coupons...</div>;
  }

  if (error) {
    return <div className="admin-error">{error}</div>;
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-content">
          <h1>Coupon Management</h1>
          <button onClick={() => navigate('/admin/dashboard')} className="back-btn">Back to Dashboard</button>
        </div>
      </header>

      <main className="admin-main">
        <section className="coupon-management">
          <div className="section-header">
            <h2>Coupons ({pagination.total || 0})</h2>
            <div className="coupon-filters">
              <input
                type="text"
                placeholder="Search coupons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="inactive">Inactive</option>
              </select>
              <button 
                onClick={() => setShowAddForm(true)} 
                className="add-coupon-btn"
              >
                Add New Coupon
              </button>
            </div>
          </div>

          <div className="coupons-table-container">
            <table className="coupons-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Discount</th>
                  <th>Min Order</th>
                  <th>Usage</th>
                  <th>Expiry</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => {
                  const status = getCouponStatus(coupon);
                  return (
                    <tr key={coupon._id}>
                      <td className="coupon-code">{coupon.code}</td>
                      <td>{coupon.name}</td>
                      <td>
                        {coupon.discountType === 'percentage' 
                          ? `${coupon.discountValue}%` 
                          : `$${coupon.discountValue}`}
                      </td>
                      <td>${coupon.minOrderAmount || '0'}</td>
                      <td>
                        {coupon.usageCount || 0}
                        {coupon.usageLimit && ` / ${coupon.usageLimit}`}
                      </td>
                      <td>{formatDate(coupon.expiryDate)}</td>
                      <td>
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(status) }}
                        >
                          {status}
                        </span>
                      </td>
                      <td>
                        <button 
                          onClick={() => handleEdit(coupon)}
                          className="action-btn-small"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {coupons.length === 0 && (
              <div className="no-coupons">
                <p>No coupons found</p>
              </div>
            )}
          </div>

          {pagination.pages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {currentPage} of {pagination.pages}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === pagination.pages}
                className="pagination-btn"
              >
                Next
              </button>
            </div>
          )}
        </section>
      </main>

      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}</h2>
            <form onSubmit={handleSubmit} className="coupon-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Coupon Code</label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    required
                    placeholder="SAVE20"
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>

                <div className="form-group">
                  <label>Coupon Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Summer Sale"
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="20% off on all items"
                  />
                </div>

                <div className="form-group">
                  <label>Discount Type</label>
                  <select name="discountType" value={formData.discountType} onChange={handleInputChange}>
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Discount Value</label>
                  <input
                    type="number"
                    name="discountValue"
                    value={formData.discountValue}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder={formData.discountType === 'percentage' ? '20' : '10'}
                  />
                </div>

                <div className="form-group">
                  <label>Minimum Order Amount</label>
                  <input
                    type="number"
                    name="minOrderAmount"
                    value={formData.minOrderAmount}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    placeholder="0"
                  />
                </div>

                <div className="form-group">
                  <label>Maximum Discount Amount</label>
                  <input
                    type="number"
                    name="maxDiscountAmount"
                    value={formData.maxDiscountAmount}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    placeholder="Optional"
                  />
                </div>

                <div className="form-group">
                  <label>Usage Limit</label>
                  <input
                    type="number"
                    name="usageLimit"
                    value={formData.usageLimit}
                    onChange={handleInputChange}
                    min="1"
                    placeholder="Optional"
                  />
                </div>

                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Expiry Date</label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                    />
                    Active
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" disabled={loading} className="submit-btn">
                  {loading ? 'Saving...' : (editingCoupon ? 'Update Coupon' : 'Add Coupon')}
                </button>
                <button type="button" onClick={handleCancel} className="cancel-btn">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponManagement;
