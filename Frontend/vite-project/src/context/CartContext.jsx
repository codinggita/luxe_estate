import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      const response = await axios.get(`${API_URL}/cart`);
      setCart(response.data.items || []);
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const addToCart = async (productId, category, quantity = 1) => {
    try {
      await axios.post(`${API_URL}/cart`, {
        productId,
        category,
        quantity
      });
      await fetchCart();
      return true;
    } catch (err) {
      console.error('Error adding to cart:', err);
      throw err;
    }
  };

  const updateQuantity = async (id, quantity) => {
    if (quantity < 1) return removeItem(id);
    try {
      await axios.patch(`${API_URL}/cart/${id}`, { quantity });
      await fetchCart();
    } catch (err) {
      console.error('Error updating quantity:', err);
      throw err;
    }
  };

  const removeItem = async (id) => {
    try {
      await axios.delete(`${API_URL}/cart/${id}`);
      await fetchCart();
    } catch (err) {
      console.error('Error removing item:', err);
      throw err;
    }
  };

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, updateQuantity, removeItem, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};
