import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config/api';
import './Admin.css';

const SubscriberManagement = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    fetchSubscribers();
  }, [navigate]);

  const fetchSubscribers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_URL}/admin/subscribers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubscribers(response.data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminInfo');
        navigate('/admin/login');
      } else {
        setError('Failed to fetch subscribers');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredSubscribers = subscribers.filter(subscriber =>
    subscriber.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportSubscribers = () => {
    const csvContent = [
      ['Email', 'Subscribed Date', 'Status'],
      ...filteredSubscribers.map(sub => [
        sub.email || 'N/A',
        sub.subscribedAt ? new Date(sub.subscribedAt).toLocaleDateString() : 'N/A',
        sub.status || 'Active'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscribers_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="admin-loading">Loading subscribers...</div>;
  }

  if (error) {
    return <div className="admin-error">{error}</div>;
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-content">
          <h1>Subscriber Management</h1>
          <button onClick={() => navigate('/admin/dashboard')} className="back-btn">Back to Dashboard</button>
        </div>
      </header>

      <main className="admin-main">
        <section className="subscriber-management">
          <div className="section-header">
            <h2>Newsletter Subscribers ({filteredSubscribers.length})</h2>
            <div className="subscriber-actions">
              <input
                type="text"
                placeholder="Search subscribers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <button onClick={exportSubscribers} className="export-btn">
                Export CSV
              </button>
            </div>
          </div>

          <div className="subscribers-table-container">
            <table className="subscribers-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Subscribed Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscribers.map((subscriber, index) => (
                  <tr key={index}>
                    <td>{subscriber.email || 'N/A'}</td>
                    <td>
                      {subscriber.subscribedAt 
                        ? new Date(subscriber.subscribedAt).toLocaleDateString()
                        : 'N/A'
                      }
                    </td>
                    <td>
                      <span className="status-badge active">
                        {subscriber.status || 'Active'}
                      </span>
                    </td>
                    <td>
                      <button className="action-btn-small">View Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredSubscribers.length === 0 && (
              <div className="no-subscribers">
                <p>No subscribers found</p>
              </div>
            )}
          </div>

          <div className="subscriber-stats">
            <div className="stat-card">
              <h3>Total Subscribers</h3>
              <p className="stat-number">{subscribers.length}</p>
            </div>
            <div className="stat-card">
              <h3>Active Subscribers</h3>
              <p className="stat-number">{subscribers.filter(s => (s.status || 'Active') === 'Active').length}</p>
            </div>
            <div className="stat-card">
              <h3>Recent Signups</h3>
              <p className="stat-number">
                {subscribers.filter(s => {
                  const subscribedDate = new Date(s.subscribedAt);
                  const thirtyDaysAgo = new Date();
                  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                  return subscribedDate > thirtyDaysAgo;
                }).length}
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default SubscriberManagement;
