import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCurrency } from './context/CurrencyContext';
import { useCart } from './context/CartContext';
import { useTranslation } from 'react-i18next';
import LuxeLoader from './components/LuxeLoader';
import './Landing.css';
import './assets/Collection/CollectionGallery.css';

// Directly defined API URL (replace with your actual backend URL)
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const ENABLE_CONVERSION_RATES = import.meta.env.VITE_ENABLE_CONVERSION_RATES === 'true';
const INLINE_PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="420" viewBox="0 0 300 420">' +
      '<rect width="100%" height="100%" fill="#f4efe6" />' +
      '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#b1976b" font-family="serif" font-size="18">Luxe Estate</text>' +
    '</svg>'
  );

const MainComponent = () => {
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantities, setQuantities] = useState({});

  const { formatPriceINR } = useCurrency();
  const { addToCart } = useCart();
  const { t } = useTranslation();

  // Define valid product categories
  const CATEGORIES = ['men', 'women', 'tshirts', 'trousers', 'shirts'];
  const SHOP_ALL_ROUTES = {
    men: '/men',
    women: '/women',
    tshirts: '/tshirt',
    shirts: '/shirt',
    trousers: '/trousers'
  };

  const handleAddToCart = async (productId, category, quantity) => {
    try {
      await addToCart(productId, category, quantity);
      alert(t('Item added to cart successfully!'));
    } catch (err) {
      alert(t('Failed to add item to cart'));
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchCartAndRates = async () => {
      try {
        const conversionRatesPromise = ENABLE_CONVERSION_RATES
          ? axios.get(`${API_URL}/conversion-rates`).catch(() => ({ data: null }))
          : Promise.resolve({ data: null });

        if (isMounted) {
          setLoading(false); // Dismiss loader early
        }

        conversionRatesPromise.catch(() => {});
      } catch (err) {
        console.error('Error fetching initial data:', err);
        if (isMounted) setLoading(false);
      }
    };

    const fetchCategories = () => {
      CATEGORIES.forEach(category => {
        axios.get(`${API_URL}/${category}`)
          .then(res => {
            if (isMounted) {
              setProducts(prev => ({
                ...prev,
                [category]: res.data.map(item => ({ ...item, categorySlug: category }))
              }));
            }
          })
          .catch(error => {
            console.error(`Error fetching ${category}:`, error);
          });
      });
    };

    fetchCartAndRates().then(() => {
      fetchCategories();
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // formatPriceINR is already imported from useCurrency

  const handleQuantityChange = (productId, value) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, Math.min(10, Number(value)))
    }));
  };

  const getDisplayCategory = (category) =>
    category.charAt(0).toUpperCase() + category.slice(1);

  const formatListPreview = (value, fallback) => {
    if (Array.isArray(value) && value.length > 0) {
      const preview = value.slice(0, 3).join(' • ');
      return value.length > 3 ? `${preview} +` : preview;
    }
    return value || fallback;
  };

  const getCategorySlug = (category = '') =>
    typeof category === 'string' ? category.toLowerCase().replace(/\s+/g, '') : 'products';

  return (
    <div className="main">
      {/* Header is now managed in App.jsx */}

      {error && (
        <div className="error-message bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <section className="hero-section">
        <video autoPlay loop muted playsInline className="hero-video">
          <source
            src="https://old-money.com/cdn/shop/videos/c/vp/fd726fc6578a4ba48c24cdd4d2c94cb3/fd726fc6578a4ba48c24cdd4d2c94cb3.HD-720p-4.5Mbps-35961835.mp4"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
        <div className="hero-overlay">
          <h2>{t('Luxury Starts and Ends With Us')}</h2> 
          <Link to="/exclusive" className="shop-btn">
            {t('Shop Exclusive Products')}
          </Link>
        </div>
      </section>

      {loading ? (
        <LuxeLoader message={t("Curating the Luxe wardrobe...")} />
      ) : (
        CATEGORIES.map(category => (
          products[category]?.length > 0 && (
            <section key={category} id={category} className="product-section">
              <h2 className="collection-title">
                {t(`${getDisplayCategory(category)} Collection`)}
              </h2>

              <div className="product-grid">
                {(SHOP_ALL_ROUTES[category] ? products[category].slice(0, 4) : products[category]).map(product => {
                  const slug = getCategorySlug(product.categorySlug || product.category || category);
                  const detailLink = product._id ? `/product/${slug}/${product._id}` : null;
                  const card = (
                    <article className="gallery-card">
                      <div className="gallery-media">
                        <img
                          src={product.image || INLINE_PLACEHOLDER}
                          alt={product.name}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src = INLINE_PLACEHOLDER;
                          }}
                        />
                        {(product.newArrival || product.sale || product.inStock === false) && (
                          <div className="product-badges">
                            {product.newArrival && <span className="badge new-arrival">New</span>}
                            {product.sale && <span className="badge sale-badge">Sale</span>}
                            {product.inStock === false && <span className="badge out-of-stock">Out</span>}
                          </div>
                        )}
                      </div>

                      <div className="gallery-info">
                        <div className="gallery-pill-row">
                          <span className="gallery-pill">{product.material || 'Premium Blend'}</span>
                          <span className="gallery-pill">{getDisplayCategory(product.category || category)}</span>
                        </div>

                        <h3 className="gallery-name">{product.name}</h3>
                        {product.description && (
                          <p className="gallery-description">
                            {product.description.length > 110
                              ? `${product.description.slice(0, 110)}…`
                              : product.description}
                          </p>
                        )}

                        <div className="gallery-price-row">
                          <span className="gallery-price">{formatPriceINR(product.price)}</span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="gallery-original">{formatPriceINR(product.originalPrice)}</span>
                          )}
                        </div>

                        <div className="gallery-meta">
                          <span>★ {product.rating || 4.8}</span>
                          <span>{formatListPreview(product.size, 'XS-XXL')}</span>
                        </div>
                      </div>
                    </article>
                  );

                  return detailLink ? (
                    <Link key={product._id} to={detailLink} className="gallery-card-link">
                      {card}
                    </Link>
                  ) : (
                    <div key={product._id || product.name} className="gallery-card-link">
                      {card}
                    </div>
                  );
                })}
              </div>

              {SHOP_ALL_ROUTES[category] && (
                <div className="section-actions">
                  <Link to={SHOP_ALL_ROUTES[category]} className="show-all-btn">
                    {t('Show All')}
                  </Link>
                </div>
              )}
            </section>
          )
        ))
      )}
      
    </div>
  );
};

export default MainComponent;