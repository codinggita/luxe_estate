const express = require('express');
const { ObjectId } = require('mongodb');

const router = express.Router();

// Initialize categories routes with database connection
const initializeCategoriesRoutes = (db) => {
  // Get all categories
  router.get('/', async (req, res) => {
    try {
      const categories = await db.collection('categories')
        .find()
        .sort({ order: 1, name: 1 })
        .toArray();
      
      res.json(categories);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  });

  // Get category by ID
  router.get('/:categoryId', async (req, res) => {
    try {
      const category = await db.collection('categories').findOne({ 
        _id: new ObjectId(req.params.categoryId) 
      });
      
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
      
      res.json(category);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch category' });
    }
  });

  // Create new category
  router.post('/', async (req, res) => {
    try {
      const { name, description, image, isActive, order, metadata } = req.body;
      
      // Check if category already exists
      const existingCategory = await db.collection('categories').findOne({ 
        name: { $regex: `^${name}$`, $options: 'i' } 
      });
      
      if (existingCategory) {
        return res.status(400).json({ error: 'Category already exists' });
      }

      const category = {
        name,
        description: description || '',
        image: image || '',
        isActive: isActive !== undefined ? isActive : true,
        order: order || 0,
        metadata: metadata || {},
        productCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await db.collection('categories').insertOne(category);
      
      res.json({
        message: 'Category created successfully',
        category: { ...category, _id: result.insertedId }
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to create category' });
    }
  });

  // Update category
  router.put('/:categoryId', async (req, res) => {
    try {
      const { name, description, image, isActive, order, metadata } = req.body;
      
      const updateData = {
        updatedAt: new Date()
      };
      
      if (name) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (image !== undefined) updateData.image = image;
      if (isActive !== undefined) updateData.isActive = isActive;
      if (order !== undefined) updateData.order = order;
      if (metadata !== undefined) updateData.metadata = metadata;

      const result = await db.collection('categories').updateOne(
        { _id: new ObjectId(req.params.categoryId) },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Category not found' });
      }

      res.json({ message: 'Category updated successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update category' });
    }
  });

  // Delete category
  router.delete('/:categoryId', async (req, res) => {
    try {
      // Check if category has products
      const category = await db.collection('categories').findOne({ 
        _id: new ObjectId(req.params.categoryId) 
      });
      
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }

      // Check if there are products in this category
      const productCollections = ['shirts', 'tshirts', 'men', 'women', 'exclusive'];
      let hasProducts = false;
      
      for (const collectionName of productCollections) {
        const count = await db.collection(collectionName).countDocuments({ 
          category: category.name.toLowerCase() 
        });
        if (count > 0) {
          hasProducts = true;
          break;
        }
      }

      if (hasProducts) {
        return res.status(400).json({ 
          error: 'Cannot delete category with existing products' 
        });
      }

      const result = await db.collection('categories').deleteOne({ 
        _id: new ObjectId(req.params.categoryId) 
      });

      res.json({ message: 'Category deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete category' });
    }
  });

  // Get category statistics
  router.get('/stats/overview', async (req, res) => {
    try {
      const categories = await db.collection('categories').find().toArray();
      const productCollections = ['shirts', 'tshirts', 'men', 'women', 'exclusive'];
      
      const categoryStats = await Promise.all(
        categories.map(async (category) => {
          let productCount = 0;
          
          for (const collectionName of productCollections) {
            const count = await db.collection(collectionName).countDocuments({ 
              category: category.name.toLowerCase() 
            });
            productCount += count;
          }
          
          return {
            _id: category._id,
            name: category.name,
            description: category.description,
            image: category.image,
            isActive: category.isActive,
            order: category.order,
            productCount,
            createdAt: category.createdAt
          };
        })
      );

      res.json({
        totalCategories: categories.length,
        activeCategories: categories.filter(cat => cat.isActive).length,
        categoryStats
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch category statistics' });
    }
  });

  return router;
};

module.exports = initializeCategoriesRoutes;
