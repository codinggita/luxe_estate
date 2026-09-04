import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config/api';
import './Admin.css';

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [cartAnalytics, setCartAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
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
      
      const [analyticsResponse, cartResponse] = await Promise.all([
        axios.get(`${API_URL}/admin/analytics`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/admin/cart-analytics`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setAnalytics(analyticsResponse.data.analytics);
      setCartAnalytics(cartResponse.data);
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

  const renderOverview = () => (
    <div className="analytics-section">
      <h2>Business Overview</h2>
      
      <div className="overview-grid">
        <div className="overview-card">
          <h3>Inventory Summary</h3>
          <div className="inventory-stats">
            <div className="stat-item">
              <span className="stat-label">Total Products</span>
              <span className="stat-value">{analytics?.products.total || 0}</span>
            </div>
            <div className="category-breakdown">
              {analytics?.products && Object.entries(analytics.products).slice(0, -1).map(([category, count]) => (
                <div key={category} className="category-stat">
                  <span className="category-name">{category.charAt(0).toUpperCase() + category.slice(1)}</span>
                  <span className="category-count">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="overview-card">
          <h3>Customer Engagement</h3>
          <div className="engagement-stats">
            <div className="stat-item">
              <span className="stat-label">Newsletter Subscribers</span>
              <span className="stat-value">{analytics?.subscribers || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Orders</span>
              <span className="stat-value">{analytics?.orders || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Active Cart Items</span>
              <span className="stat-value">{analytics?.cart.items || 0}</span>
            </div>
          </div>
        </div>

        <div className="overview-card">
          <h3>Revenue Overview</h3>
          <div className="revenue-stats">
            <div className="stat-item">
              <span className="stat-label">Cart Value</span>
              <span className="stat-value">${analytics?.cart.totalValue?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Average Order Value</span>
              <span className="stat-value">
                ${analytics?.orders > 0 ? (analytics?.cart.totalValue / analytics?.orders).toFixed(2) : '0.00'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCartAnalytics = () => (
    <div className="analytics-section">
      <h2>Shopping Cart Analytics</h2>
      
      <div className="cart-analytics-grid">
        <div className="cart-summary-card">
          <h3>Cart Summary</h3>
          <div className="cart-summary-stats">
            <div className="summary-item">
              <span className="summary-label">Total Items in Cart</span>
              <span className="summary-value">{cartAnalytics?.totalItems || 0}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Total Quantity</span>
              <span className="summary-value">{cartAnalytics?.totalQuantity || 0}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Total Cart Value</span>
              <span className="summary-value">${cartAnalytics?.totalValue?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Average Item Value</span>
              <span className="summary-value">${cartAnalytics?.averageItemValue?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
        </div>

        <div className="category-breakdown-card">
          <h3>Category Performance</h3>
          <div className="category-performance">
            {cartAnalytics?.categoryBreakdown && Object.entries(cartAnalytics.categoryBreakdown).map(([category, data]) => (
              <div key={category} className="category-performance-item">
                <div className="category-header">
                  <span className="category-name">{category.charAt(0).toUpperCase() + category.slice(1)}</span>
                  <span className="category-percentage">
                    {((data.value / cartAnalytics.totalValue) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="category-stats">
                  <span>{data.count} items</span>
                  <span>${data.value.toFixed(2)}</span>
                </div>
                <div className="category-progress-bar">
                  <div 
                    className="category-progress-fill"
                    style={{ width: `${(data.value / cartAnalytics.totalValue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSalesMetrics = () => (
    <div className="analytics-section">
      <h2>Sales Metrics</h2>
      
      <div className="sales-metrics-grid">
        <div className="metric-card">
          <h3>Conversion Metrics</h3>
          <div className="metric-stats">
            <div className="metric-item">
              <span className="metric-label">Cart to Order Conversion</span>
              <span className="metric-value">
                {analytics?.orders > 0 ? 
                  `${((analytics.orders / (analytics.cart.items || 1)) * 100).toFixed(1)}%` 
                  : '0%'}
              </span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Average Cart Size</span>
              <span className="metric-value">
                {cartAnalytics?.totalItems > 0 ? 
                  (cartAnalytics.totalQuantity / cartAnalytics.totalItems).toFixed(1) 
                  : '0'} items
              </span>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <h3>Revenue Analysis</h3>
          <div className="metric-stats">
            <div className="metric-item">
              <span className="metric-label">Potential Revenue</span>
              <span className="metric-value">${cartAnalytics?.totalValue?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Revenue per Category</span>
              <span className="metric-value">
                ${cartAnalytics?.totalValue > 0 ? 
                  (cartAnalytics.totalValue / Object.keys(cartAnalytics?.categoryBreakdown || {}).length).toFixed(2) 
                  : '0.00'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <div className="admin-loading">Loading analytics...</div>;
  }

  if (error) {
    return <div className="admin-error">{error}</div>;
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-content">
          <h1>Analytics Dashboard</h1>
          <button onClick={() => navigate('/admin/dashboard')} className="back-btn">Back to Dashboard</button>
        </div>
      </header>

      <main className="admin-main">
        <div className="analytics-tabs">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab-btn ${activeTab === 'cart' ? 'active' : ''}`}
            onClick={() => setActiveTab('cart')}
          >
            Cart Analytics
          </button>
          <button 
            className={`tab-btn ${activeTab === 'sales' ? 'active' : ''}`}
            onClick={() => setActiveTab('sales')}
          >
            Sales Metrics
          </button>
        </div>

        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'cart' && renderCartAnalytics()}
        {activeTab === 'sales' && renderSalesMetrics()}
      </main>
    </div>
  );
};

export default AdminAnalytics;
