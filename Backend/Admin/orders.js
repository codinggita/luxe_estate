const express = require('express');
const { ObjectId } = require('mongodb');

const router = express.Router();

// Initialize orders routes with database connection
const initializeOrdersRoutes = (db) => {
  // Get all orders
  router.get('/', async (req, res) => {
    try {
      const { status, page = 1, limit = 10, search } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      let filter = {};
      if (status) {
        filter.status = status;
      }
      
      if (search) {
        filter.$or = [
          { orderId: { $regex: search, $options: 'i' } },
          { customerEmail: { $regex: search, $options: 'i' } },
          { 'items.name': { $regex: search, $options: 'i' } }
        ];
      }

      const orders = await db.collection('orders')
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .toArray();

      const total = await db.collection('orders').countDocuments(filter);

      res.json({
        orders,
        pagination: {
          current: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  });

  // Get order by ID
  router.get('/:orderId', async (req, res) => {
    try {
      const order = await db.collection('orders').findOne({ 
        orderId: req.params.orderId 
      });
      
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      res.json(order);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch order' });
    }
  });

  // Create new order
  router.post('/', async (req, res) => {
    try {
      const { customerInfo, items, shippingAddress, paymentMethod, totalAmount } = req.body;
      
      const orderId = 'ORD' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
      
      const order = {
        orderId,
        customerInfo,
        items,
        shippingAddress,
        paymentMethod,
        totalAmount,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
        trackingNumber: null,
        estimatedDelivery: null
      };

      const result = await db.collection('orders').insertOne(order);
      
      res.json({
        message: 'Order created successfully',
        orderId,
        order: { ...order, _id: result.insertedId }
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to create order' });
    }
  });

  // Update order status
  router.patch('/:orderId/status', async (req, res) => {
    try {
      const { status, trackingNumber, estimatedDelivery } = req.body;
      
      const updateData = {
        status,
        updatedAt: new Date()
      };
      
      if (trackingNumber) updateData.trackingNumber = trackingNumber;
      if (estimatedDelivery) updateData.estimatedDelivery = new Date(estimatedDelivery);
      
      const result = await db.collection('orders').updateOne(
        { orderId: req.params.orderId },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }

      res.json({ message: 'Order status updated successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update order status' });
    }
  });

  // Delete order
  router.delete('/:orderId', async (req, res) => {
    try {
      const result = await db.collection('orders').deleteOne({ 
        orderId: req.params.orderId 
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }

      res.json({ message: 'Order deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete order' });
    }
  });

  // Get order statistics
  router.get('/stats/overview', async (req, res) => {
    try {
      const stats = {
        total: await db.collection('orders').countDocuments(),
        pending: await db.collection('orders').countDocuments({ status: 'pending' }),
        processing: await db.collection('orders').countDocuments({ status: 'processing' }),
        shipped: await db.collection('orders').countDocuments({ status: 'shipped' }),
        delivered: await db.collection('orders').countDocuments({ status: 'delivered' }),
        cancelled: await db.collection('orders').countDocuments({ status: 'cancelled' }),
        returned: await db.collection('orders').countDocuments({ status: 'returned' })
      };

      // Calculate total revenue
      const revenueData = await db.collection('orders').aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]).toArray();

      stats.totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

      // Get monthly revenue for the last 6 months
      const monthlyRevenue = await db.collection('orders').aggregate([
        { $match: { 
          status: { $ne: 'cancelled' },
          createdAt: { $gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) }
        }},
        { $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 }
        }},
        { $sort: { _id: 1 } }
      ]).toArray();

      stats.monthlyRevenue = monthlyRevenue;

      res.json(stats);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch order statistics' });
    }
  });

  return router;
};

module.exports = initializeOrdersRoutes;
