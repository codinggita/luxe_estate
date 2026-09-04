import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config/api';
import './Admin.css';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    fetchAnalytics();
  }, [navigate]);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_URL}/admin/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setAnalytics(response.data.analytics);
      setRecentOrders(response.data.recentOrders);
      setTopProducts(response.data.topProducts);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminInfo');
        navigate('/admin/login');
      } else {
        setError('Failed to fetch analytics');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    navigate('/admin/login');
  };

  if (loading) {
    return <div className="admin-loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="admin-error">{error}</div>;
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-content">
          <h1>Luxe Estate Admin Dashboard</h1>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <nav className="admin-nav">
        <ul>
          <li><a href="#dashboard" className="active">Dashboard</a></li>
          <li><a href="#products" onClick={() => navigate('/admin/products')}>Products</a></li>
          <li><a href="#categories" onClick={() => navigate('/admin/categories')}>Categories</a></li>
          <li><a href="#orders" onClick={() => navigate('/admin/orders')}>Orders</a></li>
          <li><a href="#returns" onClick={() => navigate('/admin/returns')}>Returns</a></li>
          <li><a href="#coupons" onClick={() => navigate('/admin/coupons')}>Coupons</a></li>
          <li><a href="#subscribers" onClick={() => navigate('/admin/subscribers')}>Subscribers</a></li>
          <li><a href="#revenue" onClick={() => navigate('/admin/revenue')}>Revenue</a></li>
          <li><a href="#analytics" onClick={() => navigate('/admin/analytics')}>Analytics</a></li>
        </ul>
      </nav>

      <main className="admin-main">
        <section className="dashboard-overview">
          <h2>Overview</h2>
          
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Products</h3>
              <p className="stat-number">{analytics?.products.total || 0}</p>
              <div className="stat-breakdown">
                <span>Shirts: {analytics?.products.shirts}</span>
                <span>T-Shirts: {analytics?.products.tshirts}</span>
                <span>Men: {analytics?.products.men}</span>
                <span>Women: {analytics?.products.women}</span>
                <span>Exclusive: {analytics?.products.exclusive}</span>
              </div>
            </div>

            <div className="stat-card">
              <h3>Total Orders</h3>
              <p className="stat-number">{analytics?.orders || 0}</p>
              <p className="stat-value">Revenue: ${analytics?.totalRevenue?.toFixed(2) || '0.00'}</p>
            </div>

            <div className="stat-card">
              <h3>Categories</h3>
              <p className="stat-number">{analytics?.categories || 0}</p>
              <p className="stat-label">Product categories</p>
            </div>

            <div className="stat-card">
              <h3>Active Coupons</h3>
              <p className="stat-number">{analytics?.activeCoupons || 0}</p>
              <p className="stat-label">Total: {analytics?.coupons || 0}</p>
            </div>

            <div className="stat-card">
              <h3>Returns</h3>
              <p className="stat-number">{analytics?.returns || 0}</p>
              <p className="stat-label">Return requests</p>
            </div>

            <div className="stat-card">
              <h3>Subscribers</h3>
              <p className="stat-number">{analytics?.subscribers || 0}</p>
              <p className="stat-label">Newsletter subscribers</p>
            </div>
          </div>
        </section>

        <section className="dashboard-charts">
          <div className="chart-container">
            <h3>Top Products</h3>
            <div className="top-products-list">
              {topProducts.length > 0 ? (
                topProducts.map((product, index) => (
                  <div key={product._id} className="top-product-item">
                    <span className="rank">#{index + 1}</span>
                    <span className="product-name">{product.name}</span>
                    <span className="product-count">{product.count} units</span>
                  </div>
                ))
              ) : (
                <p>No product data available</p>
              )}
            </div>
          </div>

          <div className="chart-container">
            <h3>Recent Orders</h3>
            <div className="recent-orders-list">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div key={order._id} className="order-item">
                    <span className="order-id">#{order._id?.slice(-6) || 'N/A'}</span>
                    <span className="order-date">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                    <span className="order-status">{order.status || 'Pending'}</span>
                  </div>
                ))
              ) : (
                <p>No recent orders</p>
              )}
            </div>
          </div>
        </section>

        <section className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <button 
              onClick={() => navigate('/admin/products')}
              className="action-btn primary"
            >
              Manage Products
            </button>
            <button 
              onClick={() => navigate('/admin/orders')}
              className="action-btn primary"
            >
              Manage Orders
            </button>
            <button 
              onClick={() => navigate('/admin/categories')}
              className="action-btn secondary"
            >
              Manage Categories
            </button>
            <button 
              onClick={() => navigate('/admin/coupons')}
              className="action-btn secondary"
            >
              Manage Coupons
            </button>
            <button 
              onClick={() => navigate('/admin/returns')}
              className="action-btn secondary"
            >
              Manage Returns
            </button>
            <button 
              onClick={() => navigate('/admin/subscribers')}
              className="action-btn secondary"
            >
              Manage Subscribers
            </button>
            <button 
              onClick={() => navigate('/admin/revenue')}
              className="action-btn secondary"
            >
              View Revenue
            </button>
            <button 
              onClick={() => navigate('/admin/analytics')}
              className="action-btn secondary"
            >
              View Analytics
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
