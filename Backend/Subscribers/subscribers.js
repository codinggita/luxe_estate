const express = require('express');

const router = express.Router();

// Initialize subscriber routes with database connection
const initializeSubscriberRoutes = (db) => {
  
  // Middleware to validate email
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email));
  };

  // Route for newsletter subscription
  router.post('/', async (req, res) => {
    const { email } = req.body;
  
    // Frontend validates too, but double-check here
    if (!email || !validateEmail(email)) {
      return res.status(400).json({ error: "Invalid email address" });
    }
  
    try {
      const subscribersCollection = db.collection("subscribers");
  
      // Optional: Check for existing subscriber
      const existingSubscriber = await subscribersCollection.findOne({ email });
      if (existingSubscriber) {
        return res.status(409).json({ error: "Email already subscribed" });
      }
  
      const result = await subscribersCollection.insertOne({ 
        email, 
        subscribedAt: new Date() 
      });
      console.log(`Subscribed: ${email}, Result: ${result.insertedId}`);
      res.status(201).json({ 
        message: "Subscribed successfully", 
        id: result.insertedId 
      });
    } catch (err) {
      console.error("Subscription error:", err);
      res.status(500).json({ 
        error: "Failed to subscribe", 
        details: err.message 
      });
    }
  });

  // Route to get all subscribers (admin only - you might want to add authentication)
  router.get('/', async (req, res) => {
    try {
      const subscribers = await db.collection("subscribers").find().toArray();
      res.json({ subscribers });
    } catch (err) {
      res.status(500).json({ error: "Error fetching subscribers" });
    }
  });

  // Route to unsubscribe
  router.delete('/:email', async (req, res) => {
    const { email } = req.params;
    
    try {
      const result = await db.collection("subscribers").deleteOne({ email });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: "Email not found in subscribers" });
      }
      
      res.json({ message: "Successfully unsubscribed" });
    } catch (err) {
      res.status(500).json({ error: "Error unsubscribing" });
    }
  });

  return router;
};

module.exports = initializeSubscriberRoutes;
