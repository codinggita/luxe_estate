import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Landing.css';

const API_URL = 'http://localhost:3000/api';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscriptionError, setSubscriptionError] = useState(null);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    setSubscriptionError(null);

    if (!email) {
      setSubscriptionError('Please enter a valid email address.');
      return;
    }

    try {
      await axios.post(`${API_URL}/subscribers`, { email });
      localStorage.setItem('subscriberEmail', email);
      alert('Subscribed successfully!');
      setEmail('');
    } catch (err) {
      console.error('Error subscribing:', err);
      setSubscriptionError('Failed to subscribe. Please try again later.');
    }
  };

  useEffect(() => {
    const savedEmail = localStorage.getItem('subscriberEmail');
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  return (
    <footer className="footer">
      <div className="footer-columns">
        <h3>The Luxe Estate</h3>
        <p>Kedar Business Hub Katargam Ved Road Surat Gujarat</p>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/shop">Shop</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/contact">Contact</Link></li>
        </ul>
      </div>
      <div className="footer-columns">
        <h4>Links</h4>
        <ul>
          <li><Link to="/payment-options">Payment Options</Link></li>
          <li><Link to="/returns">Returns</Link></li>
          <li><Link to="/privacy-policies">Privacy Policies</Link></li>
        </ul>
      </div>
      <div className="footer-columns">
        <h4>Help</h4>
        <ul>
          <li><Link to="/faq">FAQ</Link></li>
          <li><Link to="/shipping">Shipping</Link></li>
          <li><Link to="/support">Support</Link></li>
        </ul>
      </div>
      <div className="footer-columns">
        <h4>Newsletter</h4>
        <form onSubmit={handleNewsletterSubmit}>
          <input
            type="email"
            placeholder="Enter Your Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">SUBSCRIBE</button>
        </form>
        {subscriptionError && (
          <p className="error-message">{subscriptionError}</p>
        )}
      </div>
      <div className="copyright">
        <p>2023 The Luxe Estate. All rights reserved</p>
      </div>
    </footer>
  );
};

export default Footer;