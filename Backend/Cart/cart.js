const express = require('express');
const { ObjectId } = require('mongodb');

const router = express.Router();

// Initialize cart routes with database connection
const initializeCartRoutes = (db) => {
  
  // Add item to cart
  router.post('/cart', async (req, res) => {
    const { productId, category, quantity } = req.body;

    if (!productId || !category) {
      return res.status(400).json({ error: "Missing category or productId" });
    }

    try {
      const product = await db.collection(category).findOne({ _id: new ObjectId(productId) });

      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      const cartCollection = db.collection("cart");
      const existingItem = await cartCollection.findOne({ productId });

      if (existingItem) {
        await cartCollection.updateOne(
          { productId },
          { $inc: { quantity: quantity } }
        );
      } else {
        await cartCollection.insertOne({
          productId,
          category, // Save category in cart
          quantity,
          name: product.name,
          image: product.images && product.images.length > 0 ? product.images[0] : product.image,
          price: product.price,
          rating: product.rating
        });
      }

      res.json({ message: "Item added to cart successfully" });
    } catch (err) {
      res.status(500).json({ error: "Error adding item to cart" });
    }
  });

  // Fetch cart items
  router.get('/cart', async (req, res) => {
    try {
      const cartItems = await db.collection('cart').find().toArray();
      res.json({ items: cartItems });
    } catch (err) {
      res.status(500).json({ error: "Error fetching cart items" });
    }
  });

  // Delete item from cart
  router.delete('/cart/:itemId', async (req, res) => {
    const itemId = req.params.itemId;
    try {
      await db.collection('cart').deleteOne({ productId: itemId });
      res.json({ message: "Item removed from cart successfully" });
    } catch (err) {
      res.status(500).json({ error: "Error removing item from cart" });
    }
  });

  // Update quantity in cart
  router.patch('/cart/:itemId', async (req, res) => {
    const itemId = req.params.itemId;
    const { quantity } = req.body;

    try {
      const result = await db.collection('cart').updateOne(
        { productId: itemId },
        { $set: { quantity } }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: "Item not found in cart" });
      }

      res.json({ message: "Quantity updated successfully" });
    } catch (err) {
      res.status(500).json({ error: "Error updating quantity" });
    }
  });

  return router;
};

module.exports = initializeCartRoutes;
