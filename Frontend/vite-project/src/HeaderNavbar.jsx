import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCurrency } from './context/CurrencyContext';
import { useCart } from './context/CartContext';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import './Landing.css';

const HeaderNavbar = () => {
  const { 
    currency, 
    changeCurrency, 
    language, 
    changeLanguage,
    getCurrencySymbol 
  } = useCurrency();
  const { cart } = useCart();
  const { t } = useTranslation();
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  const currencies = [
    { code: 'INR', name: `₹ INR` },
    { code: 'USD', name: `$ USD` },
    { code: 'EUR', name: `€ EUR` },
    { code: 'GBP', name: `£ GBP` },
    { code: 'JPY', name: `¥ JPY` }
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' }
  ];

  const handleCurrencySelect = (cur) => {
    changeCurrency(cur);
    setShowCurrencyDropdown(false);
  };

  const handleLanguageSelect = (lang) => {
    changeLanguage(lang);
    setShowLanguageDropdown(false);
  };

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown')) {
        setShowCurrencyDropdown(false);
        setShowLanguageDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="header-navbar">
      <header className="header">
        <h2 className="le">The Luxe Estate</h2>
      </header>
      <nav className="navbar">
        <div className="nav-links">
          <Link to="/men" className="nav-btn">
            {t('Shop Men')}
          </Link>
          <Link to="/women" className="nav-btn">
            {t('Shop Women')}
          </Link>
          <Link to="/contactus" className="nav-btn" style={{ textDecoration: 'none', color: 'inherit' }}>
            {t('Contact Us')}
          </Link>
        </div>
        <div className="nav-controls">
          <div className="dropdown notranslate" translate="no">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowCurrencyDropdown(!showCurrencyDropdown);
              }}
            >
              {getCurrencySymbol()} {currency} ▼
            </button>
            {showCurrencyDropdown && (
              <ul className="dropdown-menu">
                {currencies.map((curr) => (
                  <li 
                    key={curr.code} 
                    onClick={() => handleCurrencySelect(curr.code)}
                    className={currency === curr.code ? 'active' : ''}
                  >
                    {curr.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="dropdown notranslate" translate="no">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowLanguageDropdown(!showLanguageDropdown);
              }}
            >
              {language} ▼
            </button>
            {showLanguageDropdown && (
              <ul className="dropdown-menu">
                {languages.map((lang) => (
                  <li 
                    key={lang.code} 
                    onClick={() => handleLanguageSelect(lang.code)}
                    className={language === lang.code ? 'active' : ''}
                  >
                    {lang.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Link to="/cart" className="cart-btn">
            🛒 ({cart?.length || 0})
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default HeaderNavbar;