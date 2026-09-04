import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config/api';
import './Admin.css';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    image: '',
    description: '',
    category: 'shirts',
    material: '',
    size: '',
    color: '',
    newArrival: false,
    rating: 0
  });
  const navigate = useNavigate();

  const categories = ['shirts', 'tshirts', 'men', 'women', 'exclusive'];
  const materials = ['Cotton', 'Silk', 'Linen', 'Wool', 'Polyester', 'Blend'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const colors = ['Black', 'White', 'Blue', 'Red', 'Green', 'Gray', 'Brown', 'Navy'];

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    fetchProducts();
  }, [navigate]);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_URL}/admin/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminInfo');
        navigate('/admin/login');
      } else {
        setError('Failed to fetch products');
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
      
      if (editingProduct) {
        await axios.put(
          `${API_URL}/admin/products/${editingProduct.category}/${editingProduct._id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${API_URL}/admin/products`,
          { category: formData.category, product: formData },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setShowAddForm(false);
      setEditingProduct(null);
      setFormData({
        name: '',
        price: '',
        image: '',
        description: '',
        category: 'shirts',
        material: '',
        size: '',
        color: '',
        newArrival: false,
        rating: 0
      });
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      image: product.image,
      description: product.description || '',
      category: product.category,
      material: product.material || '',
      size: product.size || '',
      color: product.color || '',
      newArrival: product.newArrival || false,
      rating: product.rating || 0
    });
    setShowAddForm(true);
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(
        `${API_URL}/admin/products/${product.category}/${product._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete product');
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      price: '',
      image: '',
      description: '',
      category: 'shirts',
      material: '',
      size: '',
      color: '',
      newArrival: false,
      rating: 0
    });
  };

  if (loading && products.length === 0) {
    return <div className="admin-loading">Loading products...</div>;
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-content">
          <h1>Product Management</h1>
          <button onClick={() => navigate('/admin/dashboard')} className="back-btn">Back to Dashboard</button>
        </div>
      </header>

      <main className="admin-main">
        {error && <div className="admin-error">{error}</div>}

        <section className="product-management">
          <div className="section-header">
            <h2>All Products</h2>
            <button 
              onClick={() => setShowAddForm(true)} 
              className="add-product-btn"
            >
              Add New Product
            </button>
          </div>

          <div className="products-grid">
            {products.map((product) => (
              <div key={product._id} className="product-card">
                <img src={product.image} alt={product.name} className="product-image" />
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="product-category">{product.category}</p>
                  <p className="product-price">${product.price}</p>
                  <p className="product-description">{product.description}</p>
                  <div className="product-details">
                    {product.material && <span>Material: {product.material}</span>}
                    {product.size && <span>Size: {product.size}</span>}
                    {product.color && <span>Color: {product.color}</span>}
                    {product.newArrival && <span className="new-arrival">New Arrival</span>}
                  </div>
                </div>
                <div className="product-actions">
                  <button onClick={() => handleEdit(product)} className="edit-btn">Edit</button>
                  <button onClick={() => handleDelete(product)} className="delete-btn">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {showAddForm && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <form onSubmit={handleSubmit} className="product-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Product Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Price</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Image URL</label>
                    <input
                      type="url"
                      name="image"
                      value={formData.image}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Category</label>
                    <select name="category" value={formData.category} onChange={handleInputChange}>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Material</label>
                    <select name="material" value={formData.material} onChange={handleInputChange}>
                      <option value="">Select Material</option>
                      {materials.map(mat => (
                        <option key={mat} value={mat}>{mat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Size</label>
                    <select name="size" value={formData.size} onChange={handleInputChange}>
                      <option value="">Select Size</option>
                      {sizes.map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Color</label>
                    <select name="color" value={formData.color} onChange={handleInputChange}>
                      <option value="">Select Color</option>
                      {colors.map(color => (
                        <option key={color} value={color}>{color}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Rating</label>
                    <input
                      type="number"
                      name="rating"
                      value={formData.rating}
                      onChange={handleInputChange}
                      min="0"
                      max="5"
                      step="0.1"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="4"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        name="newArrival"
                        checked={formData.newArrival}
                        onChange={handleInputChange}
                      />
                      New Arrival
                    </label>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" disabled={loading} className="submit-btn">
                    {loading ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product')}
                  </button>
                  <button type="button" onClick={handleCancel} className="cancel-btn">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProductManagement;
