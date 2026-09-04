import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config/api';
import './Admin.css';

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSetup, setIsSetup] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/admin/login`, credentials);
      
      if (response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
        localStorage.setItem('adminInfo', JSON.stringify(response.data.admin));
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSetup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/admin/setup`, credentials);
      
      if (response.data.admin) {
        setIsSetup(false);
        setError('Admin account created! Please login.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Setup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <h1>Luxe Estate Admin</h1>
          <p>{isSetup ? 'Create Admin Account' : 'Sign In to Admin Panel'}</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={isSetup ? handleSetup : handleLogin} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              required
              placeholder="admin@luxeestate.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>

          {isSetup && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={credentials.name || ''}
                onChange={handleChange}
                required
                placeholder="Admin Name"
              />
            </div>
          )}

          <button type="submit" disabled={loading} className="admin-login-btn">
            {loading ? 'Please wait...' : (isSetup ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <div className="admin-login-footer">
          <button 
            type="button" 
            onClick={() => setIsSetup(!isSetup)}
            className="toggle-setup-btn"
          >
            {isSetup ? 'Already have an account? Sign In' : 'Need to create admin account?'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
