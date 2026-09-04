import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FiShoppingCart, FiHeart, FiShare2, FiPlus, FiMinus, FiEye, FiChevronDown, FiChevronUp, FiCheckCircle, FiShield, FiTruck } from 'react-icons/fi';
import { useCurrency } from '../../context/CurrencyContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { useTranslation } from 'react-i18next';
import './ProductDetail.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const ProductDetail = () => {
  const { category, productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [activeAccordion, setActiveAccordion] = useState('details');
  const { formatPriceINR } = useCurrency();
  const { addToCart } = useCart();
  const { t } = useTranslation();

  useEffect(() => {
    fetchProduct();
    fetchRelatedProducts();
  }, [category, productId]);

  // Auto-play carousel
  useEffect(() => {
    if (isAutoPlaying && product && product.images && product.images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => 
          prevIndex === product.images.length - 1 ? 0 : prevIndex + 1
        );
      }, 3000); // Change image every 3 seconds

      return () => clearInterval(interval);
    }
  }, [isAutoPlaying, product]);

  const handleImageChange = (index) => {
    setCurrentImageIndex(index);
    setIsAutoPlaying(false); // Stop auto-play when user manually changes image
  };

  const fetchProduct = async () => {
    try {
      console.log('Fetching product:', `${API_URL}/${category}/${productId}`);
      const response = await axios.get(`${API_URL}/${category}/${productId}`);
      console.log('Product response:', response.data);
      setProduct(response.data);
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Product not found');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/${category}`);
      setRelatedProducts(response.data.slice(0, 4));
    } catch (err) {
      console.error('Error fetching related products:', err);
    }
  };

  const handleAddToCartClick = async () => {
    if (product.inStock === false) return;
    try {
      await addToCart(productId, category, quantity);
      alert(t('Product added to cart successfully!'));
    } catch (err) {
      alert(t('Failed to add product to cart'));
    }
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const toggleAccordion = (section) => {
    setActiveAccordion(activeAccordion === section ? null : section);
  };

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="page-loader">
          <div className="luxe-ring">
            <div className="luxe-initials">LE</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-page">
        <div className="error-message">
          <h2>{t('Product not found')}</h2>
          <p>{t("The product you're looking for doesn't exist.")}</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            {t('Go Back Home')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="product-detail-page">
        <div className="product-detail-container">
          <div className="product-detail-content">
            <div className="product-image-section">
              <div className="main-image-container">
                <img 
                  src={(product.images && product.images[currentImageIndex]) || product.image || 'https://via.placeholder.com/600x800?text=Luxe+Product'} 
                  alt={product.name}
                  className="product-main-image"
                  loading="lazy"
                />
              </div>
              {product.images && product.images.length > 1 && (
                <div className="thumbnail-gallery">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => handleImageChange(index)}
                      className={`thumbnail ${currentImageIndex === index ? 'active' : ''}`}
                    >
                      <img 
                        src={image} 
                        alt={`${product.name} - View ${index + 1}`}
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="product-info-section">
              <div className="product-header">
                <h1 className="product-title">{product.name}</h1>
                <div className="product-badges">
                  {product.newArrival && <span className="badge new-arrival">NEW</span>}
                  {product.sale && <span className="badge sale-badge">SALE</span>}
                  {product.inStock === false ? (
                    <span className="badge out-of-stock">OUT OF STOCK</span>
                  ) : (
                    <span className="badge in-stock">
                      <FiCheckCircle style={{ marginRight: '4px' }} /> IN STOCK
                    </span>
                  )}
                </div>
              </div>
              
              <div className="price-section">
                <div className="price-container">
                  <span className="current-price">{formatPriceINR(product.price)}</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="original-price">{formatPriceINR(product.originalPrice)}</span>
                  )}
                </div>
                {product.originalPrice && product.originalPrice > product.price && (
                  <div className="discount-percentage">
                    -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                  </div>
                )}
              </div>
              
              <div className="product-rating">
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} className={i < Math.floor(product.rating || 4.8) ? 'star-filled' : 'star-empty'}>★</span>
                ))}
                <span className="rating-text">{product.ratingCount || 1} {t('Customer Reviews')}</span>
              </div>

              <div className="product-detail-actions">
                <div className="quantity-selector">
                  <label>{t('Quantity')}</label>
                  <div className="quantity-controls">
                    <button 
                      className="quantity-btn" 
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1 || product.inStock === false}
                    >
                      <FiMinus />
                    </button>
                    <span className="quantity-value">{quantity}</span>
                    <button 
                      className="quantity-btn" 
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= 10 || product.inStock === false}
                    >
                      <FiPlus />
                    </button>
                  </div>
                </div>

                <div className="action-buttons">
                  <button 
                    className="add-to-cart-btn" 
                    onClick={handleAddToCartClick}
                    disabled={product.inStock === false}
                  >
                    <FiShoppingCart size={18} />
                    {product.inStock === false ? t('Out of Stock') : t('Add to Cart')}
                  </button>
                  <button className="wishlist-btn">
                    <FiHeart size={18} />
                  </button>
                </div>
              </div>

              {/* Collapsible Accordions for Premium Details */}
              <div className="premium-accordions">
                <div className={`accordion-item ${activeAccordion === 'details' ? 'active' : ''}`}>
                  <button className="accordion-header" onClick={() => toggleAccordion('details')}>
                    <span>{t('The Details')}</span>
                    {activeAccordion === 'details' ? <FiChevronUp /> : <FiChevronDown />}
                  </button>
                  <div className="accordion-content">
                    <p className="precise-description">
                      {product.description || t("This exceptional piece represents the pinnacle of luxury fashion. Meticulously crafted with premium materials and traditional techniques, it offers unparalleled comfort and style. The attention to detail is evident in every stitch, making it a perfect addition to any sophisticated wardrobe.")}
                    </p>
                    <p className="precise-description">
                      {t("Designed for the discerning individual who appreciates quality and elegance, this product combines timeless design with modern functionality. Whether for special occasions or everyday luxury, it delivers exceptional value and lasting satisfaction.")}
                    </p>
                    <div className="meta-grid">
                      <div className="meta-box">
                        <span className="meta-label">SKU</span>
                        <span className="meta-value">{product._id.slice(-6).toUpperCase()}</span>
                      </div>
                      <div className="meta-box">
                        <span className="meta-label">{t('Category')}</span>
                        <span className="meta-value">{category}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`accordion-item ${activeAccordion === 'materials' ? 'active' : ''}`}>
                  <button className="accordion-header" onClick={() => toggleAccordion('materials')}>
                    <span>{t('Materials & Care')}</span>
                    {activeAccordion === 'materials' ? <FiChevronUp /> : <FiChevronDown />}
                  </button>
                  <div className="accordion-content">
                    {product.features && (
                      <ul className="materials-list">
                        {product.features.map((feature, index) => (
                          <li key={index}><FiCheckCircle className="check-icon"/> {feature}</li>
                        ))}
                        {product.material && <li><FiCheckCircle className="check-icon"/> {t('Primary Material')}: {product.material}</li>}
                      </ul>
                    )}
                    {!product.features && (
                      <p className="precise-description">{t("Crafted with uncompromising attention to detail using only the finest sourced materials to ensure longevity and superior feel.")}</p>
                    )}
                  </div>
                </div>

                <div className={`accordion-item ${activeAccordion === 'shipping' ? 'active' : ''}`}>
                  <button className="accordion-header" onClick={() => toggleAccordion('shipping')}>
                    <span>{t('Shipping & Returns')}</span>
                    {activeAccordion === 'shipping' ? <FiChevronUp /> : <FiChevronDown />}
                  </button>
                  <div className="accordion-content">
                    <ul className="shipping-list">
                      <li><FiTruck className="shipping-icon"/> <strong>{t('Complimentary Shipping')}</strong> {t('on all orders over $500.')}</li>
                      <li><FiShield className="shipping-icon"/> <strong>{t('Free Returns')}</strong> {t('within 30 days of delivery.')}</li>
                      <li><span className="shipping-icon">✈️</span> <strong>{t('Express Delivery')}</strong> {t('available globally.')}</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="share-section">
                <label>{t('Share This Piece')}</label>
                <div className="share-buttons">
                  <button className="share-btn">📘</button>
                  <button className="share-btn">📷</button>
                  <button className="share-btn">🐦</button>
                </div>
              </div>
            </div>
          </div>

          <div className="related-products-section">
            <div className="section-header">
              <h2>{t('You May Also Like')}</h2>
              <div className="section-divider"></div>
            </div>
            <div className="related-products-grid">
              {relatedProducts.map(relatedProduct => {
                const categorySlug = relatedProduct.category?.toLowerCase().replace(/\s+/g, '') || 'products';
                const detailLink = `/product/${categorySlug}/${relatedProduct._id}`;
                
                return (
                  <Link key={relatedProduct._id} to={detailLink} className="related-product-card">
                    <div className="related-product-image">
                      <img 
                        src={relatedProduct.image || 'https://via.placeholder.com/300x400?text=Luxe+Product'} 
                        alt={relatedProduct.name}
                        loading="lazy"
                      />
                      {relatedProduct.newArrival && <span className="related-badge">New</span>}
                    </div>
                    <div className="related-product-info">
                      <h4>{relatedProduct.name}</h4>
                      <p className="related-price">{formatPriceINR(relatedProduct.price)}</p>
                      <div className="related-rating">
                        ★ {relatedProduct.rating || 4.8}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="view-all-container">
              <Link to={`/category/${category}`} className="view-all-btn">
                {t('View All')} {t(category)} {t('Products')} →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetail;
