const express = require('express');
const { ObjectId } = require('mongodb');

const router = express.Router();

// Initialize returns routes with database connection
const initializeReturnsRoutes = (db) => {
  // Get all returns
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
          { returnId: { $regex: search, $options: 'i' } },
          { orderId: { $regex: search, $options: 'i' } },
          { customerEmail: { $regex: search, $options: 'i' } },
          { 'items.name': { $regex: search, $options: 'i' } }
        ];
      }

      const returns = await db.collection('returns')
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .toArray();

      const total = await db.collection('returns').countDocuments(filter);

      res.json({
        returns,
        pagination: {
          current: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch returns' });
    }
  });

  // Get return by ID
  router.get('/:returnId', async (req, res) => {
    try {
      const returnItem = await db.collection('returns').findOne({ 
        returnId: req.params.returnId 
      });
      
      if (!returnItem) {
        return res.status(404).json({ error: 'Return not found' });
      }
      
      res.json(returnItem);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch return' });
    }
  });

  // Create new return request
  router.post('/', async (req, res) => {
    try {
      const { 
        orderId, 
        customerInfo, 
        items, 
        reason, 
        returnMethod, 
        refundMethod,
        refundAmount,
        customerNotes 
      } = req.body;
      
      const returnId = 'RET' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
      
      const returnItem = {
        returnId,
        orderId,
        customerInfo,
        items,
        reason,
        returnMethod, // 'pickup', 'dropoff', 'mail'
        refundMethod, // 'original', 'store_credit', 'exchange'
        refundAmount,
        customerNotes: customerNotes || '',
        status: 'pending', // pending, approved, rejected, processing, completed, cancelled
        adminNotes: '',
        trackingNumber: null,
        refundProcessed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await db.collection('returns').insertOne(returnItem);
      
      // Update order status to reflect return
      await db.collection('orders').updateOne(
        { orderId },
        { $push: { returns: returnId }, $set: { updatedAt: new Date() } }
      );
      
      res.json({
        message: 'Return request created successfully',
        returnId,
        returnItem: { ...returnItem, _id: result.insertedId }
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to create return request' });
    }
  });

  // Update return status
  router.patch('/:returnId/status', async (req, res) => {
    try {
      const { status, adminNotes, trackingNumber, refundProcessed } = req.body;
      
      const updateData = {
        status,
        updatedAt: new Date()
      };
      
      if (adminNotes) updateData.adminNotes = adminNotes;
      if (trackingNumber) updateData.trackingNumber = trackingNumber;
      if (refundProcessed !== undefined) updateData.refundProcessed = refundProcessed;
      
      const result = await db.collection('returns').updateOne(
        { returnId: req.params.returnId },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Return not found' });
      }

      res.json({ message: 'Return status updated successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update return status' });
    }
  });

  // Delete return
  router.delete('/:returnId', async (req, res) => {
    try {
      const returnItem = await db.collection('returns').findOne({ 
        returnId: req.params.returnId 
      });
      
      if (!returnItem) {
        return res.status(404).json({ error: 'Return not found' });
      }

      // Remove return ID from order
      await db.collection('orders').updateOne(
        { orderId: returnItem.orderId },
        { $pull: { returns: req.params.returnId } }
      );

      const result = await db.collection('returns').deleteOne({ 
        returnId: req.params.returnId 
      });

      res.json({ message: 'Return deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete return' });
    }
  });

  // Get return statistics
  router.get('/stats/overview', async (req, res) => {
    try {
      const stats = {
        total: await db.collection('returns').countDocuments(),
        pending: await db.collection('returns').countDocuments({ status: 'pending' }),
        approved: await db.collection('returns').countDocuments({ status: 'approved' }),
        rejected: await db.collection('returns').countDocuments({ status: 'rejected' }),
        processing: await db.collection('returns').countDocuments({ status: 'processing' }),
        completed: await db.collection('returns').countDocuments({ status: 'completed' }),
        cancelled: await db.collection('returns').countDocuments({ status: 'cancelled' })
      };

      // Calculate total refund amount
      const refundData = await db.collection('returns').aggregate([
        { $match: { status: { $in: ['approved', 'processing', 'completed'] } } },
        { $group: { _id: null, totalRefund: { $sum: '$refundAmount' } } }
      ]).toArray();

      stats.totalRefundAmount = refundData.length > 0 ? refundData[0].totalRefund : 0;

      // Get return reasons breakdown
      const reasonsBreakdown = await db.collection('returns').aggregate([
        { $group: { _id: '$reason', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]).toArray();

      stats.reasonsBreakdown = reasonsBreakdown;

      // Get monthly returns for the last 6 months
      const monthlyReturns = await db.collection('returns').aggregate([
        { $match: { 
          createdAt: { $gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) }
        }},
        { $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          returns: { $sum: 1 },
          refundAmount: { $sum: '$refundAmount' }
        }},
        { $sort: { _id: 1 } }
      ]).toArray();

      stats.monthlyReturns = monthlyReturns;

      res.json(stats);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch return statistics' });
    }
  });

  return router;
};

module.exports = initializeReturnsRoutes;
