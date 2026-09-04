import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config/api';
import './Admin.css';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    isActive: true,
    order: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    fetchCategories();
  }, [navigate]);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_URL}/admin/categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(response.data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminInfo');
        navigate('/admin/login');
      } else {
        setError('Failed to fetch categories');
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
      
      if (editingCategory) {
        await axios.put(
          `${API_URL}/admin/categories/${editingCategory._id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${API_URL}/admin/categories`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setShowAddForm(false);
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        image: '',
        isActive: true,
        order: 0
      });
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      image: category.image,
      isActive: category.isActive,
      order: category.order
    });
    setShowAddForm(true);
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`Are you sure you want to delete "${category.name}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(
        `${API_URL}/admin/categories/${category._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete category');
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      image: '',
      isActive: true,
      order: 0
    });
  };

  const toggleCategoryStatus = async (category) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(
        `${API_URL}/admin/categories/${category._id}`,
        { isActive: !category.isActive },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCategories();
    } catch (err) {
      setError('Failed to update category status');
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading categories...</div>;
  }

  if (error) {
    return <div className="admin-error">{error}</div>;
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-content">
          <h1>Category Management</h1>
          <button onClick={() => navigate('/admin/dashboard')} className="back-btn">Back to Dashboard</button>
        </div>
      </header>

      <main className="admin-main">
        <section className="category-management">
          <div className="section-header">
            <h2>Categories ({categories.length})</h2>
            <button 
              onClick={() => setShowAddForm(true)} 
              className="add-category-btn"
            >
              Add New Category
            </button>
          </div>

          <div className="categories-grid">
            {categories.map((category) => (
              <div key={category._id} className="category-card">
                <div className="category-image">
                  {category.image ? (
                    <img src={category.image} alt={category.name} />
                  ) : (
                    <div className="placeholder-image">
                      <span>No Image</span>
                    </div>
                  )}
                </div>
                <div className="category-info">
                  <h3>{category.name}</h3>
                  <p className="category-description">{category.description}</p>
                  <div className="category-meta">
                    <span className={`status-indicator ${category.isActive ? 'active' : 'inactive'}`}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="category-order">Order: {category.order}</span>
                  </div>
                </div>
                <div className="category-actions">
                  <button onClick={() => handleEdit(category)} className="edit-btn">Edit</button>
                  <button 
                    onClick={() => toggleCategoryStatus(category)}
                    className={`status-btn ${category.isActive ? 'deactivate' : 'activate'}`}
                  >
                    {category.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button onClick={() => handleDelete(category)} className="delete-btn">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
            <form onSubmit={handleSubmit} className="category-form">
              <div className="form-group">
                <label>Category Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Men's Clothing"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Brief description of the category"
                />
              </div>

              <div className="form-group">
                <label>Image URL</label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="form-group">
                <label>Display Order</label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="0 (highest priority)"
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
                  Active (visible to customers)
                </label>
              </div>

              <div className="form-actions">
                <button type="submit" disabled={loading} className="submit-btn">
                  {loading ? 'Saving...' : (editingCategory ? 'Update Category' : 'Add Category')}
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

export default CategoryManagement;
