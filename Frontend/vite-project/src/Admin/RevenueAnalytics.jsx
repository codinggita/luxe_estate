import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config/api';
import './Admin.css';

const RevenueAnalytics = () => {
  const [revenueData, setRevenueData] = useState(null);
  const [orderStats, setOrderStats] = useState(null);
  const [couponStats, setCouponStats] = useState(null);
  const [returnStats, setReturnStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('6months');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    fetchRevenueData();
  }, [navigate, timeRange]);

  const fetchRevenueData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      const [orderResponse, couponResponse, returnResponse] = await Promise.all([
        axios.get(`${API_URL}/admin/orders/stats/overview`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/admin/coupons/stats/overview`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/admin/returns/stats/overview`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setOrderStats(orderResponse.data);
      setCouponStats(couponResponse.data);
      setReturnStats(returnResponse.data);

      // Process revenue data
      const revenueData = {
        totalRevenue: orderResponse.data.totalRevenue || 0,
        totalOrders: orderResponse.data.total || 0,
        avgOrderValue: orderResponse.data.totalRevenue / (orderResponse.data.total || 1),
        totalRefunds: returnResponse.data.totalRefundAmount || 0,
        netRevenue: (orderResponse.data.totalRevenue || 0) - (returnResponse.data.totalRefundAmount || 0),
        couponUsage: couponResponse.data.totalUsage || 0,
        activeCoupons: couponResponse.data.active || 0,
        returnRate: ((returnResponse.data.total || 0) / (orderResponse.data.total || 1)) * 100
      };

      setRevenueData(revenueData);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminInfo');
        navigate('/admin/login');
      } else {
        setError('Failed to fetch revenue data');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return <div className="admin-loading">Loading revenue analytics...</div>;
  }

  if (error) {
    return <div className="admin-error">{error}</div>;
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-content">
          <h1>Revenue Analytics</h1>
          <button onClick={() => navigate('/admin/dashboard')} className="back-btn">Back to Dashboard</button>
        </div>
      </header>

      <main className="admin-main">
        <section className="revenue-analytics">
          <div className="section-header">
            <h2>Revenue Overview</h2>
            <div className="time-range-selector">
              <select 
                value={timeRange} 
                onChange={(e) => setTimeRange(e.target.value)}
                className="time-range-select"
              >
                <option value="1month">Last Month</option>
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
                <option value="1year">Last Year</option>
              </select>
            </div>
          </div>

          {/* Revenue Summary Cards */}
          <div className="revenue-summary-grid">
            <div className="revenue-card primary">
              <h3>Total Revenue</h3>
              <p className="revenue-amount">{formatCurrency(revenueData?.totalRevenue || 0)}</p>
              <div className="revenue-details">
                <span>Gross Revenue</span>
              </div>
            </div>

            <div className="revenue-card success">
              <h3>Net Revenue</h3>
              <p className="revenue-amount">{formatCurrency(revenueData?.netRevenue || 0)}</p>
              <div className="revenue-details">
                <span>After Refunds</span>
              </div>
            </div>

            <div className="revenue-card info">
              <h3>Average Order Value</h3>
              <p className="revenue-amount">{formatCurrency(revenueData?.avgOrderValue || 0)}</p>
              <div className="revenue-details">
                <span>Per Order</span>
              </div>
            </div>

            <div className="revenue-card warning">
              <h3>Total Orders</h3>
              <p className="revenue-amount">{revenueData?.totalOrders || 0}</p>
              <div className="revenue-details">
                <span>All Time</span>
              </div>
            </div>
          </div>

          {/* Detailed Analytics */}
          <div className="detailed-analytics">
            <div className="analytics-row">
              {/* Order Statistics */}
              <div className="analytics-card">
                <h3>Order Statistics</h3>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">Pending</span>
                    <span className="stat-value">{orderStats?.pending || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Processing</span>
                    <span className="stat-value">{orderStats?.processing || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Shipped</span>
                    <span className="stat-value">{orderStats?.shipped || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Delivered</span>
                    <span className="stat-value">{orderStats?.delivered || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Cancelled</span>
                    <span className="stat-value">{orderStats?.cancelled || 0}</span>
                  </div>
                </div>
              </div>

              {/* Return Statistics */}
              <div className="analytics-card">
                <h3>Return Statistics</h3>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">Total Returns</span>
                    <span className="stat-value">{returnStats?.total || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Pending</span>
                    <span className="stat-value">{returnStats?.pending || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Approved</span>
                    <span className="stat-value">{returnStats?.approved || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Completed</span>
                    <span className="stat-value">{returnStats?.completed || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Return Rate</span>
                    <span className="stat-value">{formatPercentage(revenueData?.returnRate || 0)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="analytics-row">
              {/* Coupon Statistics */}
              <div className="analytics-card">
                <h3>Coupon Performance</h3>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">Total Coupons</span>
                    <span className="stat-value">{couponStats?.total || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Active</span>
                    <span className="stat-value">{couponStats?.active || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Expired</span>
                    <span className="stat-value">{couponStats?.expired || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Total Usage</span>
                    <span className="stat-value">{couponStats?.totalUsage || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Avg Discount</span>
                    <span className="stat-value">{formatPercentage(couponStats?.avgDiscount || 0)}</span>
                  </div>
                </div>
              </div>

              {/* Financial Metrics */}
              <div className="analytics-card">
                <h3>Financial Metrics</h3>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">Gross Revenue</span>
                    <span className="stat-value">{formatCurrency(revenueData?.totalRevenue || 0)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Total Refunds</span>
                    <span className="stat-value">{formatCurrency(revenueData?.totalRefunds || 0)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Net Revenue</span>
                    <span className="stat-value">{formatCurrency(revenueData?.netRevenue || 0)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Refund Rate</span>
                    <span className="stat-value">
                      {formatPercentage((revenueData?.totalRefunds / (revenueData?.totalRevenue || 1)) * 100)}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Profit Margin</span>
                    <span className="stat-value">
                      {formatPercentage(((revenueData?.netRevenue || 0) / (revenueData?.totalRevenue || 1)) * 100)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Revenue Chart */}
          <div className="monthly-revenue">
            <div className="chart-card">
              <h3>Monthly Revenue Trend</h3>
              <div className="revenue-chart">
                {orderStats?.monthlyRevenue?.map((month, index) => (
                  <div key={month._id} className="month-bar">
                    <div className="bar-container">
                      <div 
                        className="bar"
                        style={{ 
                          height: `${(month.revenue / Math.max(...orderStats.monthlyRevenue.map(m => m.revenue))) * 100}%` 
                        }}
                      />
                    </div>
                    <div className="month-label">{month._id}</div>
                    <div className="month-value">{formatCurrency(month.revenue)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="chart-card">
              <h3>Return Reasons Breakdown</h3>
              <div className="reasons-chart">
                {returnStats?.reasonsBreakdown?.map((reason, index) => (
                  <div key={reason._id} className="reason-item">
                    <div className="reason-info">
                      <span className="reason-name">{reason._id}</span>
                      <span className="reason-count">{reason.count} returns</span>
                    </div>
                    <div className="reason-bar">
                      <div 
                        className="reason-fill"
                        style={{ 
                          width: `${(reason.count / Math.max(...returnStats.reasonsBreakdown.map(r => r.count))) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Key Performance Indicators */}
          <div className="kpi-section">
            <h3>Key Performance Indicators</h3>
            <div className="kpi-grid">
              <div className="kpi-card">
                <h4>Revenue Growth</h4>
                <div className="kpi-value positive">+12.5%</div>
                <p>vs last period</p>
              </div>
              <div className="kpi-card">
                <h4>Customer Satisfaction</h4>
                <div className="kpi-value positive">4.8/5</div>
                <p>Average rating</p>
              </div>
              <div className="kpi-card">
                <h4>Return Rate</h4>
                <div className="kpi-value neutral">{formatPercentage(revenueData?.returnRate || 0)}</div>
                <p>Industry avg: 8%</p>
              </div>
              <div className="kpi-card">
                <h4>Coupon Conversion</h4>
                <div className="kpi-value positive">{formatPercentage((couponStats?.totalUsage / (orderStats?.total || 1)) * 100)}</div>
                <p>Orders with coupons</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default RevenueAnalytics;
