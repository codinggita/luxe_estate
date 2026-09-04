import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config/api';
import './Admin.css';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    fetchOrders();
  }, [navigate, currentPage, statusFilter, searchTerm]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10
      });
      
      if (statusFilter) params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await axios.get(`${API_URL}/admin/orders?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setOrders(response.data.orders);
      setPagination(response.data.pagination);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminInfo');
        navigate('/admin/login');
      } else {
        setError('Failed to fetch orders');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.patch(`${API_URL}/admin/orders/${orderId}/status`, {
        status: newStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      fetchOrders();
      if (selectedOrder && selectedOrder.orderId === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (err) {
      setError('Failed to update order status');
    }
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      processing: '#3b82f6',
      shipped: '#8b5cf6',
      delivered: '#10b981',
      cancelled: '#ef4444',
      returned: '#6b7280'
    };
    return colors[status] || '#6b7280';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString() + ' ' + 
           new Date(dateString).toLocaleTimeString();
  };

  if (loading) {
    return <div className="admin-loading">Loading orders...</div>;
  }

  if (error) {
    return <div className="admin-error">{error}</div>;
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-content">
          <h1>Order Management</h1>
          <button onClick={() => navigate('/admin/dashboard')} className="back-btn">Back to Dashboard</button>
        </div>
      </header>

      <main className="admin-main">
        <section className="order-management">
          <div className="section-header">
            <h2>All Orders ({pagination.total || 0})</h2>
            <div className="order-filters">
              <input
                type="text"
                placeholder="Search orders..."
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
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="returned">Returned</option>
              </select>
            </div>
          </div>

          <div className="orders-table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.orderId}>
                    <td className="order-id">#{order.orderId}</td>
                    <td>{order.customerInfo?.name || 'N/A'}</td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>{order.items?.length || 0} items</td>
                    <td className="order-total">${order.totalAmount?.toFixed(2) || '0.00'}</td>
                    <td>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(order.status) }}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <button 
                        onClick={() => viewOrderDetails(order)}
                        className="action-btn-small"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {orders.length === 0 && (
              <div className="no-orders">
                <p>No orders found</p>
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

      {showOrderDetails && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal order-details-modal">
            <div className="modal-header">
              <h2>Order Details - #{selectedOrder.orderId}</h2>
              <button onClick={() => setShowOrderDetails(false)} className="close-btn">&times;</button>
            </div>

            <div className="order-details-content">
              <div className="order-info-grid">
                <div className="info-section">
                  <h3>Customer Information</h3>
                  <p><strong>Name:</strong> {selectedOrder.customerInfo?.name}</p>
                  <p><strong>Email:</strong> {selectedOrder.customerInfo?.email}</p>
                  <p><strong>Phone:</strong> {selectedOrder.customerInfo?.phone}</p>
                </div>

                <div className="info-section">
                  <h3>Shipping Address</h3>
                  <p>{selectedOrder.shippingAddress?.street}</p>
                  <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}</p>
                  <p>{selectedOrder.shippingAddress?.zipCode}</p>
                  <p>{selectedOrder.shippingAddress?.country}</p>
                </div>

                <div className="info-section">
                  <h3>Order Information</h3>
                  <p><strong>Date:</strong> {formatDate(selectedOrder.createdAt)}</p>
                  <p><strong>Payment:</strong> {selectedOrder.paymentMethod}</p>
                  <p><strong>Total:</strong> ${selectedOrder.totalAmount?.toFixed(2)}</p>
                  <p><strong>Status:</strong> 
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(selectedOrder.status) }}
                    >
                      {selectedOrder.status}
                    </span>
                  </p>
                </div>
              </div>

              <div className="order-items">
                <h3>Order Items</h3>
                <div className="items-list">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="order-item">
                      <span>{item.name}</span>
                      <span>Qty: {item.quantity}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="order-actions">
                <h3>Update Status</h3>
                <div className="status-actions">
                  <button 
                    onClick={() => updateOrderStatus(selectedOrder.orderId, 'processing')}
                    disabled={selectedOrder.status !== 'pending'}
                    className="status-btn processing"
                  >
                    Mark as Processing
                  </button>
                  <button 
                    onClick={() => updateOrderStatus(selectedOrder.orderId, 'shipped')}
                    disabled={selectedOrder.status !== 'processing'}
                    className="status-btn shipped"
                  >
                    Mark as Shipped
                  </button>
                  <button 
                    onClick={() => updateOrderStatus(selectedOrder.orderId, 'delivered')}
                    disabled={selectedOrder.status !== 'shipped'}
                    className="status-btn delivered"
                  >
                    Mark as Delivered
                  </button>
                  <button 
                    onClick={() => updateOrderStatus(selectedOrder.orderId, 'cancelled')}
                    disabled={['delivered', 'returned'].includes(selectedOrder.status)}
                    className="status-btn cancelled"
                  >
                    Cancel Order
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

export default OrderManagement;
