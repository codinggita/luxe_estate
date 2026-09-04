import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from 'react';
import ScrollToTop from "./components/ScrollToTop";
import MainComponent from "./MainComponent";
import Cart from "./assets/Cart/Cart";
import ContactPage from "./assets/Contactus/ContactUs";
import LuxuryAuth from "./Signin/LuxuryAuth";
import TshirtCollection from "./assets/T-Shirt/T-Shirt";
import ShirtCollection from "./assets/Shirt/Shirt";
import TrousersCollection from "./assets/Trousers/Trousers";
import ExclusiveProducts from "./assets/Exclusive/Exclusive";
import Mens from "./assets/Mens/Mens";
import Womens from "./assets/Womens/Womens";
import ProductDetail from "./assets/ProductDetail/ProductDetail";
import HeaderNavbar from "./HeaderNavbar";
import Footer from "./Footer";
import AdminLogin from "./Admin/AdminLogin";
import AdminDashboard from "./Admin/AdminDashboard";
import ProductManagement from "./Admin/ProductManagement";
import AdminAnalytics from "./Admin/AdminAnalytics";
import SubscriberManagement from "./Admin/SubscriberManagement";
import OrderManagement from "./Admin/OrderManagement";
import CategoryManagement from "./Admin/CategoryManagement";
import CouponManagement from "./Admin/CouponManagement";
import ReturnManagement from "./Admin/ReturnManagement";
import RevenueAnalytics from "./Admin/RevenueAnalytics";
import './assets/GenderCollection/GenderCollection.css';

const App = () => {

  return (
    <Router>
      <ScrollToTop />
      <HeaderNavbar />
      <main>
        <Routes>
          <Route path="/" element={<MainComponent />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/contactus" element={<ContactPage />} />
          <Route path="/signin" element={<LuxuryAuth />} />
          <Route path="/tshirt" element={<TshirtCollection />} />
          <Route path="/shirt" element={<ShirtCollection />} />
          <Route path="/trousers" element={<TrousersCollection />} />
          <Route path="/exclusive" element={<ExclusiveProducts />} />
          <Route path="/men" element={<Mens />} />
          <Route path="/women" element={<Womens />} />
          <Route path="/product/:category/:productId" element={<ProductDetail />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<ProductManagement />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/subscribers" element={<SubscriberManagement />} />
          <Route path="/admin/orders" element={<OrderManagement />} />
          <Route path="/admin/categories" element={<CategoryManagement />} />
          <Route path="/admin/coupons" element={<CouponManagement />} />
          <Route path="/admin/returns" element={<ReturnManagement />} />
          <Route path="/admin/revenue" element={<RevenueAnalytics />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
};

export default App;
