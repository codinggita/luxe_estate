import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config/api';
import './Admin.css';

const ReturnManagement = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [showReturnDetails, setShowReturnDetails] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    fetchReturns();
  }, [navigate, currentPage, statusFilter, searchTerm]);

  const fetchReturns = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10
      });
      
      if (statusFilter) params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await axios.get(`${API_URL}/admin/returns?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setReturns(response.data.returns);
      setPagination(response.data.pagination);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminInfo');
        navigate('/admin/login');
      } else {
        setError('Failed to fetch returns');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateReturnStatus = async (returnId, newStatus, adminNotes = '') => {
    try {
      const token = localStorage.getItem('adminToken');
      const updateData = { status: newStatus };
      if (adminNotes) updateData.adminNotes = adminNotes;

      await axios.patch(`${API_URL}/admin/returns/${returnId}/status`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      fetchReturns();
      if (selectedReturn && selectedReturn.returnId === returnId) {
        setSelectedReturn({ ...selectedReturn, status: newStatus, adminNotes });
      }
    } catch (err) {
      setError('Failed to update return status');
    }
  };

  const viewReturnDetails = (returnItem) => {
    setSelectedReturn(returnItem);
    setShowReturnDetails(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      approved: '#10b981',
      rejected: '#ef4444',
      processing: '#3b82f6',
      completed: '#8b5cf6',
      cancelled: '#6b7280'
    };
    return colors[status] || '#6b7280';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString() + ' ' + 
           new Date(dateString).toLocaleTimeString();
  };

  const getRefundMethodColor = (method) => {
    const colors = {
      original: '#10b981',
      store_credit: '#3b82f6',
      exchange: '#8b5cf6'
    };
    return colors[method] || '#6b7280';
  };

  if (loading) {
    return <div className="admin-loading">Loading returns...</div>;
  }

  if (error) {
    return <div className="admin-error">{error}</div>;
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-content">
          <h1>Return Management</h1>
          <button onClick={() => navigate('/admin/dashboard')} className="back-btn">Back to Dashboard</button>
        </div>
      </header>

      <main className="admin-main">
        <section className="return-management">
          <div className="section-header">
            <h2>Returns ({pagination.total || 0})</h2>
            <div className="return-filters">
              <input
                type="text"
                placeholder="Search returns..."
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
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="returns-table-container">
            <table className="returns-table">
              <thead>
                <tr>
                  <th>Return ID</th>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Reason</th>
                  <th>Refund</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {returns.map((returnItem) => (
                  <tr key={returnItem.returnId}>
                    <td className="return-id">#{returnItem.returnId}</td>
                    <td>#{returnItem.orderId}</td>
                    <td>{returnItem.customerInfo?.name || 'N/A'}</td>
                    <td>{returnItem.items?.length || 0} items</td>
                    <td>{returnItem.reason}</td>
                    <td>
                      <span 
                        className="refund-method-badge"
                        style={{ backgroundColor: getRefundMethodColor(returnItem.refundMethod) }}
                      >
                        {returnItem.refundMethod}
                      </span>
                      <br />
                      <small>${returnItem.refundAmount?.toFixed(2) || '0.00'}</small>
                    </td>
                    <td>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(returnItem.status) }}
                      >
                        {returnItem.status}
                      </span>
                    </td>
                    <td>{formatDate(returnItem.createdAt)}</td>
                    <td>
                      <button 
                        onClick={() => viewReturnDetails(returnItem)}
                        className="action-btn-small"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {returns.length === 0 && (
              <div className="no-returns">
                <p>No returns found</p>
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

      {showReturnDetails && selectedReturn && (
        <div className="modal-overlay">
          <div className="modal return-details-modal">
            <div className="modal-header">
              <h2>Return Details - #{selectedReturn.returnId}</h2>
              <button onClick={() => setShowReturnDetails(false)} className="close-btn">&times;</button>
            </div>

            <div className="return-details-content">
              <div className="return-info-grid">
                <div className="info-section">
                  <h3>Customer Information</h3>
                  <p><strong>Name:</strong> {selectedReturn.customerInfo?.name}</p>
                  <p><strong>Email:</strong> {selectedReturn.customerInfo?.email}</p>
                  <p><strong>Phone:</strong> {selectedReturn.customerInfo?.phone}</p>
                </div>

                <div className="info-section">
                  <h3>Return Information</h3>
                  <p><strong>Order ID:</strong> #{selectedReturn.orderId}</p>
                  <p><strong>Date:</strong> {formatDate(selectedReturn.createdAt)}</p>
                  <p><strong>Reason:</strong> {selectedReturn.reason}</p>
                  <p><strong>Return Method:</strong> {selectedReturn.returnMethod}</p>
                  <p><strong>Refund Method:</strong> {selectedReturn.refundMethod}</p>
                  <p><strong>Refund Amount:</strong> ${selectedReturn.refundAmount?.toFixed(2)}</p>
                  <p><strong>Status:</strong> 
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(selectedReturn.status) }}
                    >
                      {selectedReturn.status}
                    </span>
                  </p>
                </div>
              </div>

              <div className="return-items">
                <h3>Returned Items</h3>
                <div className="items-list">
                  {selectedReturn.items?.map((item, index) => (
                    <div key={index} className="return-item">
                      <span>{item.name}</span>
                      <span>Qty: {item.quantity}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedReturn.customerNotes && (
                <div className="customer-notes">
                  <h3>Customer Notes</h3>
                  <p>{selectedReturn.customerNotes}</p>
                </div>
              )}

              {selectedReturn.adminNotes && (
                <div className="admin-notes">
                  <h3>Admin Notes</h3>
                  <p>{selectedReturn.adminNotes}</p>
                </div>
              )}

              <div className="return-actions">
                <h3>Update Status</h3>
                <div className="status-actions">
                  <button 
                    onClick={() => updateReturnStatus(selectedReturn.returnId, 'approved')}
                    disabled={selectedReturn.status !== 'pending'}
                    className="status-btn approved"
                  >
                    Approve Return
                  </button>
                  <button 
                    onClick={() => updateReturnStatus(selectedReturn.returnId, 'rejected')}
                    disabled={selectedReturn.status !== 'pending'}
                    className="status-btn rejected"
                  >
                    Reject Return
                  </button>
                  <button 
                    onClick={() => updateReturnStatus(selectedReturn.returnId, 'processing')}
                    disabled={selectedReturn.status !== 'approved'}
                    className="status-btn processing"
                  >
                    Mark as Processing
                  </button>
                  <button 
                    onClick={() => updateReturnStatus(selectedReturn.returnId, 'completed')}
                    disabled={selectedReturn.status !== 'processing'}
                    className="status-btn completed"
                  >
                    Mark as Completed
                  </button>
                  <button 
                    onClick={() => updateReturnStatus(selectedReturn.returnId, 'cancelled')}
                    disabled={['completed'].includes(selectedReturn.status)}
                    className="status-btn cancelled"
                  >
                    Cancel Return
                  </button>
                </div>

                <div className="admin-notes-section">
                  <h4>Add Admin Notes</h4>
                  <textarea
                    placeholder="Enter notes about this return..."
                    rows="3"
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
                    id="adminNotesTextarea"
                  />
                  <button 
                    onClick={() => {
                      const notes = document.getElementById('adminNotesTextarea').value;
                      updateReturnStatus(selectedReturn.returnId, selectedReturn.status, notes);
                    }}
                    className="add-notes-btn"
                  >
                    Add Notes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReturnManagement;
