const express = require('express');
const { ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Import additional route modules
const initializeOrdersRoutes = require('./orders');
const initializeCategoriesRoutes = require('./categories');
const initializeCouponsRoutes = require('./coupons');
const initializeReturnsRoutes = require('./returns');

// Initialize admin routes with database connection
const initializeAdminRoutes = (db) => {
  const JWT_SECRET = process.env.JWT_SECRET || 'luxe_estate_admin_secret_key_2024';

  // Admin login
  router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
      const admin = await db.collection('admins').findOne({ email });
      
      if (!admin) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, admin.password);
      
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: admin._id, email: admin.email, role: 'admin' },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        token,
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role
        }
      });
    } catch (err) {
      res.status(500).json({ error: 'Login failed' });
    }
  });

  // Create default admin if none exists
  router.post('/setup', async (req, res) => {
    const { name, email, password } = req.body;

    try {
      const existingAdmin = await db.collection('admins').findOne({ email });
      
      if (existingAdmin) {
        return res.status(400).json({ error: 'Admin already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const result = await db.collection('admins').insertOne({
        name,
        email,
        password: hashedPassword,
        role: 'admin',
        createdAt: new Date()
      });

      res.json({
        message: 'Admin created successfully',
        admin: {
          id: result.insertedId,
          name,
          email,
          role: 'admin'
        }
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to create admin' });
    }
  });

  // Middleware to verify admin token
  const verifyAdmin = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      console.log('No token provided in Authorization header');
      console.log('Authorization header:', req.header('Authorization'));
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.admin = decoded;
      next();
    } catch (err) {
      console.log('JWT verification failed:', err.message);
      res.status(401).json({ error: 'Invalid token' });
    }
  };

  // Initialize additional route modules
  const ordersRoutes = initializeOrdersRoutes(db);
  const categoriesRoutes = initializeCategoriesRoutes(db);
  const couponsRoutes = initializeCouponsRoutes(db);
  const returnsRoutes = initializeReturnsRoutes(db);

  // Helper function to safely count documents
  const safeCount = async (collectionName) => {
    try {
      return await db.collection(collectionName).countDocuments();
    } catch (err) {
      return 0;
    }
  };

  // Test endpoint (no auth required)
  router.get('/test', async (req, res) => {
    try {
      // Simple test without complex operations
      res.json({ 
        message: 'Admin routes are working',
        timestamp: new Date().toISOString(),
        status: 'OK'
      });
    } catch (err) {
      console.error('Test endpoint error:', err);
      res.status(500).json({ error: 'Test endpoint failed', details: err.message });
    }
  });

  // Get dashboard analytics
  router.get('/analytics', verifyAdmin, async (req, res) => {
    try {
      // Helper function to safely find documents
      const safeFind = async (collectionName, query = {}, options = {}) => {
        try {
          return await db.collection(collectionName).find(query, options).toArray();
        } catch (err) {
          return [];
        }
      };

      // Helper function to safely aggregate
      const safeAggregate = async (collectionName, pipeline) => {
        try {
          return await db.collection(collectionName).aggregate(pipeline).toArray();
        } catch (err) {
          return [];
        }
      };

      const analytics = {
        products: {
          shirts: await safeCount('shirts'),
          tshirts: await safeCount('tshirts'),
          men: await safeCount('men'),
          women: await safeCount('women'),
          exclusive: await safeCount('exclusive'),
          total: 0
        },
        cart: {
          items: await safeCount('cart'),
          totalValue: 0
        },
        subscribers: await safeCount('subscribers'),
        orders: await safeCount('orders'),
        categories: await safeCount('categories'),
        coupons: await safeCount('coupons'),
        returns: await safeCount('returns')
      };

      // Calculate totals
      analytics.products.total = Object.values(analytics.products).slice(0, -1).reduce((a, b) => a + b, 0);

      // Calculate cart total value
      const cartItems = await safeFind('cart');
      analytics.cart.totalValue = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

      // Get order statistics
      const orderStats = await safeAggregate('orders', [
        { $group: { 
          _id: null, 
          totalRevenue: { $sum: '$totalAmount' },
          avgOrderValue: { $avg: '$totalAmount' }
        }}
      ]);
      
      analytics.totalRevenue = orderStats.length > 0 ? orderStats[0].totalRevenue : 0;
      analytics.avgOrderValue = orderStats.length > 0 ? orderStats[0].avgOrderValue : 0;

      // Get recent orders
      const recentOrders = await safeFind('orders', {}, { sort: { createdAt: -1 }, limit: 5 });

      // Get top products
      const topProducts = await safeAggregate('cart', [
        { $group: { _id: '$productId', name: { $first: '$name' }, count: { $sum: '$quantity' } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]);

      // Get active coupons
      const activeCoupons = await safeCount('coupons', { 
        isActive: true, 
        expiryDate: { $gt: new Date() } 
      });

      analytics.activeCoupons = activeCoupons;

      res.json({
        analytics,
        recentOrders,
        topProducts
      });
    } catch (err) {
      console.error('Analytics error:', err);
      res.status(500).json({ error: 'Failed to fetch analytics', details: err.message });
    }
  });

  // Get all products from all collections (temporarily disabled for debugging)
  // router.get('/products', verifyAdmin, async (req, res) => {
  //   try {
  //     const collections = ['shirts', 'tshirts', 'men', 'women', 'exclusive'];
  //     const allProducts = [];

  //     for (const collectionName of collections) {
  //       const products = await db.collection(collectionName).find().toArray();
  //       products.forEach(product => {
  //         allProducts.push({
  //           ...product,
  //           category: collectionName
  //         });
  //       });
  //     }

  //     res.json(allProducts);
  //   } catch (err) {
  //     res.status(500).json({ error: 'Failed to fetch products' });
  //   }
  // });

  // Add new product
  router.post('/products', verifyAdmin, async (req, res) => {
    const { category, product } = req.body;

    const validCategories = ['shirts', 'tshirts', 'men', 'women', 'exclusive'];
    
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    try {
      const result = await db.collection(category).insertOne({
        ...product,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      res.json({
        message: 'Product created successfully',
        productId: result.insertedId
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to create product' });
    }
  });

  // Update product
  router.put('/products/:category/:productId', verifyAdmin, async (req, res) => {
    const { category, productId } = req.params;
    const updates = req.body;

    const validCategories = ['shirts', 'tshirts', 'men', 'women', 'exclusive'];
    
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    try {
      const result = await db.collection(category).updateOne(
        { _id: new ObjectId(productId) },
        { 
          $set: {
            ...updates,
            updatedAt: new Date()
          }
        }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }

      res.json({ message: 'Product updated successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update product' });
    }
  });

  // Delete product
  router.delete('/products/:category/:productId', verifyAdmin, async (req, res) => {
    const { category, productId } = req.params;

    const validCategories = ['shirts', 'tshirts', 'men', 'women', 'exclusive'];
    
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    try {
      const result = await db.collection(category).deleteOne({ _id: new ObjectId(productId) });

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }

      res.json({ message: 'Product deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete product' });
    }
  });

  // Get all subscribers
  router.get('/subscribers', verifyAdmin, async (req, res) => {
    try {
      const subscribers = await db.collection('subscribers').find().sort({ subscribedAt: -1 }).toArray();
      res.json(subscribers);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch subscribers' });
    }
  });

  // Get cart analytics
  router.get('/cart-analytics', verifyAdmin, async (req, res) => {
    try {
      const cartItems = await db.collection('cart').find().toArray();
      
      const analytics = {
        totalItems: cartItems.length,
        totalQuantity: cartItems.reduce((sum, item) => sum + item.quantity, 0),
        totalValue: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        averageItemValue: 0,
        categoryBreakdown: {}
      };

      analytics.averageItemValue = analytics.totalValue / analytics.totalItems || 0;

      // Category breakdown
      cartItems.forEach(item => {
        if (!analytics.categoryBreakdown[item.category]) {
          analytics.categoryBreakdown[item.category] = {
            count: 0,
            value: 0
          };
        }
        analytics.categoryBreakdown[item.category].count += item.quantity;
        analytics.categoryBreakdown[item.category].value += (item.price * item.quantity);
      });

      res.json(analytics);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch cart analytics' });
    }
  });

  // Use the additional route modules with admin prefix and authentication (temporarily disabled)
  // router.use('/orders', verifyAdmin, ordersRoutes);
  // router.use('/categories', verifyAdmin, categoriesRoutes);
  // router.use('/coupons', verifyAdmin, couponsRoutes);
  // router.use('/returns', verifyAdmin, returnsRoutes);

  return router;
};

module.exports = initializeAdminRoutes;
