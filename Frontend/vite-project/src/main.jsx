import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { CurrencyProvider } from './context/CurrencyContext';
import { CartProvider } from './context/CartContext';
import './i18n.js';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CurrencyProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </CurrencyProvider>
  </React.StrictMode>
);
