import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCurrency } from "../../context/CurrencyContext.jsx";
import { useCart } from "../../context/CartContext.jsx";
import { useTranslation } from "react-i18next";
import "./Cart.css";
import { FiShoppingBag, FiTrash2, FiPlus, FiMinus, FiHeart } from "react-icons/fi";

const Cart = () => {
  const [error, setError] = useState(null);
  const { formatPriceINR } = useCurrency();
  const { cart: cartItems, loading, updateQuantity, removeItem, fetchCart } = useCart();
  const { t } = useTranslation();

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);
  };

  const calculateTax = () => {
    // Assuming 18% tax rate
    const taxRate = 0.18;
    return calculateSubtotal() * taxRate;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  if (loading) {
    return (
      <div className="cart-page">
        <div className="cart-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cart-page">
        <div className="cart-container">
          <div className="error-message">
            <p>{t(error)}</p>
            <button onClick={fetchCart}>{t('Try Again')}</button>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-container">
          <div className="empty-cart">
            <div className="empty-cart-icon">
              <FiShoppingBag size={48} />
            </div>
            <h2>{t('Your cart is empty')}</h2>
            <p>{t("Looks like you haven't added anything to your cart yet.")}</p>
            <Link to="/" className="shop-btn">
              {t('Continue Shopping')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-header">
          <h1>{t('Your Shopping Cart')}</h1>
          <p>{cartItems.length} {cartItems.length === 1 ? t('item') : t('items')} {t('in cart')}</p>
        </div>

        <div className="cart-grid">
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item._id} className="cart-item">
                <div className="cart-item-image">
                  <div className="image-container">
                    <div className="image-fallback">
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="product-image"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      ) : (
                        <div className="no-image">
                          <span>No Image</span>
                        </div>
                      )}
                      <div className="no-image" style={{display: 'none'}}>
                        <span>Image not available</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="cart-item-details">
                  <div className="product-header">
                    <h3 className="cart-item-title">{item.name}</h3>
                    <span className="product-category">{t(item.category || 'Luxury Apparel')}</span>
                  </div>
                  
                  <div className="product-meta">
                    <div className="meta-item">
                      <span className="meta-label">{t('Product ID')}:</span>
                      <span className="meta-value">{item._id?.substring(0, 8) || 'N/A'}</span>
                    </div>
                    {item.size && (
                      <div className="meta-item">
                        <span className="meta-label">{t('Size')}:</span>
                        <span className="meta-value">{item.size}</span>
                      </div>
                    )}
                    {item.color && (
                      <div className="meta-item">
                        <span className="meta-label">{t('Color')}:</span>
                        <span className="meta-value">{item.color}</span>
                      </div>
                    )}
                    <div className="meta-item">
                      <span className="meta-label">{t('Unit Price')}:</span>
                      <span className="meta-value">{formatPriceINR(item.price || 0)}</span>
                    </div>
                  </div>

                  <div className="product-actions">
                    <div className="quantity-selector">
                      <button 
                        className="quantity-btn" 
                        onClick={() => updateQuantity(item._id, (item.quantity || 1) - 1)}
                        aria-label="Decrease quantity"
                      >
                        <FiMinus size={14} />
                      </button>
                      <span className="quantity-display">{item.quantity || 1}</span>
                      <button 
                        className="quantity-btn" 
                        onClick={() => updateQuantity(item._id, (item.quantity || 1) + 1)}
                        aria-label="Increase quantity"
                      >
                        <FiPlus size={14} />
                      </button>
                    </div>
                    <div className="action-buttons">
                      <button className="wishlist-btn">
                        <FiHeart size={16} /> {t('Save for later')}
                      </button>
                      <button 
                        className="remove-btn" 
                        onClick={() => removeItem(item._id)}
                      >
                        <FiTrash2 size={16} /> {t('Remove')}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="cart-item-price">
                  <div className="price-amount">
                    {formatPriceINR((item.price || 0) * (item.quantity || 1))}
                  </div>
                  {item.quantity > 1 && (
                    <div className="per-unit">
                      {formatPriceINR(item.price || 0)} {t('each')}
                    </div>
                  )}
                  {item.inStock !== false ? (
                    <div className="stock-status in-stock">{t('In Stock')}</div>
                  ) : (
                    <div className="stock-status out-of-stock">{t('Out of Stock')}</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3 className="summary-title">{t('Order Summary')}</h3>
            <div className="summary-row">
              <span>{t('Subtotal')}</span>
              <span>{formatPriceINR(calculateSubtotal())}</span>
            </div>
            <div className="summary-row">
              <span>{t('Shipping')}</span>
              <span>{t('Free')}</span>
            </div>
            <div className="summary-row">
              <span>{t('Tax')}</span>
              <span>{formatPriceINR(calculateTax())}</span>
            </div>
            <div className="summary-total">
              <span>{t('Total')}</span>
              <span>{formatPriceINR(calculateTotal())}</span>
            </div>
            <button className="checkout-btn">
              {t('Proceed to Checkout')}
            </button>
            <Link to="/" className="continue-shopping">
              {t('Continue Shopping')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;