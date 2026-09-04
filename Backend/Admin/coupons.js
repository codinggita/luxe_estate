const express = require('express');
const { ObjectId } = require('mongodb');

const router = express.Router();

// Initialize coupons routes with database connection
const initializeCouponsRoutes = (db) => {
  // Get all coupons
  router.get('/', async (req, res) => {
    try {
      const { status, page = 1, limit = 10, search } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      let filter = {};
      if (status) {
        if (status === 'active') {
          filter.isActive = true;
          filter.expiryDate = { $gt: new Date() };
        } else if (status === 'expired') {
          filter.expiryDate = { $lte: new Date() };
        } else if (status === 'inactive') {
          filter.isActive = false;
        }
      }
      
      if (search) {
        filter.$or = [
          { code: { $regex: search, $options: 'i' } },
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      const coupons = await db.collection('coupons')
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .toArray();

      const total = await db.collection('coupons').countDocuments(filter);

      res.json({
        coupons,
        pagination: {
          current: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch coupons' });
    }
  });

  // Get coupon by ID
  router.get('/:couponId', async (req, res) => {
    try {
      const coupon = await db.collection('coupons').findOne({ 
        _id: new ObjectId(req.params.couponId) 
      });
      
      if (!coupon) {
        return res.status(404).json({ error: 'Coupon not found' });
      }
      
      res.json(coupon);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch coupon' });
    }
  });

  // Create new coupon
  router.post('/', async (req, res) => {
    try {
      const { 
        code, 
        name, 
        description, 
        discountType, 
        discountValue, 
        minOrderAmount, 
        maxDiscountAmount,
        usageLimit,
        usageCount,
        startDate,
        expiryDate,
        isActive,
        applicableProducts,
        applicableCategories
      } = req.body;
      
      // Check if coupon code already exists
      const existingCoupon = await db.collection('coupons').findOne({ 
        code: code.toUpperCase() 
      });
      
      if (existingCoupon) {
        return res.status(400).json({ error: 'Coupon code already exists' });
      }

      const coupon = {
        code: code.toUpperCase(),
        name,
        description: description || '',
        discountType, // 'percentage' or 'fixed'
        discountValue,
        minOrderAmount: minOrderAmount || 0,
        maxDiscountAmount: maxDiscountAmount || null,
        usageLimit: usageLimit || null,
        usageCount: usageCount || 0,
        startDate: startDate ? new Date(startDate) : new Date(),
        expiryDate: new Date(expiryDate),
        isActive: isActive !== undefined ? isActive : true,
        applicableProducts: applicableProducts || [],
        applicableCategories: applicableCategories || [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await db.collection('coupons').insertOne(coupon);
      
      res.json({
        message: 'Coupon created successfully',
        coupon: { ...coupon, _id: result.insertedId }
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to create coupon' });
    }
  });

  // Update coupon
  router.put('/:couponId', async (req, res) => {
    try {
      const { 
        name, 
        description, 
        discountType, 
        discountValue, 
        minOrderAmount, 
        maxDiscountAmount,
        usageLimit,
        startDate,
        expiryDate,
        isActive,
        applicableProducts,
        applicableCategories
      } = req.body;
      
      const updateData = {
        updatedAt: new Date()
      };
      
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (discountType !== undefined) updateData.discountType = discountType;
      if (discountValue !== undefined) updateData.discountValue = discountValue;
      if (minOrderAmount !== undefined) updateData.minOrderAmount = minOrderAmount;
      if (maxDiscountAmount !== undefined) updateData.maxDiscountAmount = maxDiscountAmount;
      if (usageLimit !== undefined) updateData.usageLimit = usageLimit;
      if (startDate !== undefined) updateData.startDate = new Date(startDate);
      if (expiryDate !== undefined) updateData.expiryDate = new Date(expiryDate);
      if (isActive !== undefined) updateData.isActive = isActive;
      if (applicableProducts !== undefined) updateData.applicableProducts = applicableProducts;
      if (applicableCategories !== undefined) updateData.applicableCategories = applicableCategories;

      const result = await db.collection('coupons').updateOne(
        { _id: new ObjectId(req.params.couponId) },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Coupon not found' });
      }

      res.json({ message: 'Coupon updated successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update coupon' });
    }
  });

  // Delete coupon
  router.delete('/:couponId', async (req, res) => {
    try {
      const result = await db.collection('coupons').deleteOne({ 
        _id: new ObjectId(req.params.couponId) 
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Coupon not found' });
      }

      res.json({ message: 'Coupon deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete coupon' });
    }
  });

  // Validate coupon
  router.post('/validate', async (req, res) => {
    try {
      const { code, orderAmount, products, categories } = req.body;
      
      const coupon = await db.collection('coupons').findOne({ 
        code: code.toUpperCase(),
        isActive: true,
        expiryDate: { $gt: new Date() },
        startDate: { $lte: new Date() }
      });
      
      if (!coupon) {
        return res.status(400).json({ error: 'Invalid or expired coupon' });
      }

      // Check usage limit
      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        return res.status(400).json({ error: 'Coupon usage limit exceeded' });
      }

      // Check minimum order amount
      if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
        return res.status(400).json({ 
          error: `Minimum order amount of $${coupon.minOrderAmount} required` 
        });
      }

      // Calculate discount
      let discountAmount = 0;
      if (coupon.discountType === 'percentage') {
        discountAmount = (orderAmount * coupon.discountValue) / 100;
        if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
          discountAmount = coupon.maxDiscountAmount;
        }
      } else {
        discountAmount = coupon.discountValue;
      }

      res.json({
        valid: true,
        coupon: {
          code: coupon.code,
          name: coupon.name,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          discountAmount
        },
        finalAmount: orderAmount - discountAmount
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to validate coupon' });
    }
  });

  // Get coupon statistics
  router.get('/stats/overview', async (req, res) => {
    try {
      const stats = {
        total: await db.collection('coupons').countDocuments(),
        active: await db.collection('coupons').countDocuments({ 
          isActive: true,
          expiryDate: { $gt: new Date() }
        }),
        expired: await db.collection('coupons').countDocuments({ 
          expiryDate: { $lte: new Date() }
        }),
        inactive: await db.collection('coupons').countDocuments({ isActive: false })
      };

      // Get usage statistics
      const usageStats = await db.collection('coupons').aggregate([
        { $group: {
          _id: null,
          totalUsage: { $sum: '$usageCount' },
          avgDiscount: { $avg: '$discountValue' }
        }}
      ]).toArray();

      stats.totalUsage = usageStats.length > 0 ? usageStats[0].totalUsage : 0;
      stats.avgDiscount = usageStats.length > 0 ? usageStats[0].avgDiscount : 0;

      res.json(stats);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch coupon statistics' });
    }
  });

  return router;
};

module.exports = initializeCouponsRoutes;
