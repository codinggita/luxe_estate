  const express = require('express');
  const axios = require('axios');
  const { MongoClient, ObjectId } = require('mongodb');
  const cors = require('cors');

  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  const uri = "mongodb+srv://deepgoyani77:1234@cluster0.u6fyq.mongodb.net/";
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  async function main() {
    try {
      await client.connect();
      console.log("Connected to MongoDB successfully");
      const db = client.db("LandingPage");

      // Middleware to validate email
      const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email));
      };

      // Route to fetch products by category
      app.get('/api/:category', async (req, res) => {
        const category = req.params.category;
        try {
          const products = await db.collection(category).find().toArray();
          res.json(products);
        } catch (err) {
          res.status(500).json({ error: "Error fetching products" });
        }
      });

      // Route for newsletter subscription
    // Add item to cart
  // Add item to cart
  app.post('/api/cart', async (req, res) => {
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
          image: product.image,
          price: product.price,
          rating: product.rating
        });
      }

      res.json({ message: "Item added to cart successfully" });
    } catch (err) {
      res.status(500).json({ error: "Error adding item to cart" });
    }
  });

  app.post('/api/subscribers', async (req, res) => {
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
  
      const result = await subscribersCollection.insertOne({ email, subscribedAt: new Date() });
      console.log(`Subscribed: ${email}, Result: ${result.insertedId}`);
      res.status(201).json({ message: "Subscribed successfully", id: result.insertedId });
    } catch (err) {
      console.error("Subscription error:", err);
      res.status(500).json({ error: "Failed to subscribe", details: err.message });
    }
  });
  // Fetch cart items
  app.get('/api/cart', async (req, res) => {
    try {
      const cartItems = await db.collection('cart').find().toArray();
      res.json({ items: cartItems });
    } catch {
      res.status(500).json({ error: "Error fetching cart items" });
    }
  });

  // Delete item from cart// Delete item from cart (Fix: Convert productId to ObjectId)
  app.delete('/api/cart/:itemId', async (req, res) => {
    const itemId = req.params.itemId;
    try {
      await db.collection('cart').deleteOne({ productId: itemId });
      res.json({ message: "Item removed from cart successfully" });
    } catch (err) {
      res.status(500).json({ error: "Error removing item from cart" });
    }
  });

  // Update quantity in cart (Fix: Convert productId to ObjectId)
  app.patch('/api/cart/:itemId', async (req, res) => {
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
  app.get('/api/shirts', async (req, res) => {
    const { material } = req.query;
    try {
      let query = {};
      if (material) {
        query = { material: material };
      }
      const shirts = await db.collection("shirts").find(query).toArray();
      res.json(shirts);
    } catch (err) {
      res.status(500).json({ error: "Error fetching shirts" });
    }
  });
      // Route to fetch product details by category and ID
      app.get('/api/:category/:productId', async (req, res) => {
        const { category, productId } = req.params;
        try {
          const product = await db.collection(category).findOne({ _id: new ObjectId(productId) });
          if (!product) {
            return res.status(404).json({ error: "Product not found" });
          }
          res.json(product);
        } catch (err) {
          res.status(500).json({ error: "Error fetching product" });
        }
      });
      app.get("/api/tshirts", (req, res) => {
        const { material } = req.query;
      
        const tshirts = [
          {
            name: "Premium T-Shirt",
            imageUrl: "https://your-image-url.com/tshirt1.png",
            price: 29.99,
            newArrival: true,
            material: "Cashmere",
          },
          {
            name: "Luxury Merino Tee",
            imageUrl: "https://your-image-url.com/tshirt2.png",
            price: 39.99,
            newArrival: false,
            material: "Merino Wool",
          },
        ];
      
        const filteredTshirts = tshirts.filter((tshirt) => tshirt.material === material);
        res.json(filteredTshirts);
      });
      app.get("/api/tshirts", async (req, res) => {
        const { material } = req.query;
      
        try {
          const tshirts = await db.collection("tshirts").find({ material }).toArray();
          res.json(tshirts);
        } catch (err) {
          res.status(500).json({ error: "Error fetching T-shirts" });
        }
      });
      // Route to fetch conversion rates
      app.get('/api/conversion-rates', async (req, res) => {
        try {
          const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
          res.json(response.data.rates);
        } catch (err) {
          res.status(500).json({ error: "Error fetching conversion rates" });
        }
      });
      
      app.get('/tshirts', async (req, res) => {
        try {
            const { sort, minPrice, maxPrice, size, color, newArrival } = req.query;
            let filter = {};
    
            // Price Range Filter
            if (minPrice && maxPrice) {
                filter.price = { $gte: parseInt(minPrice), $lte: parseInt(maxPrice) };
            }
    
            // Size Filter (checks if the size exists in array)
            if (size) {
                filter.size = size;
            }
    
            // Color Filter (checks if the color exists in array)
            if (color) {
                filter.color = color;
            }
    
            // New Arrival Filter
            if (newArrival) {
                filter.newArrival = newArrival === "true";
            }
    
            // Sorting Logic
            let sortOption = {};
            if (sort === "price_asc") {
                sortOption.price = 1; // Low to High
            } else if (sort === "price_desc") {
                sortOption.price = -1; // High to Low
            } else if (sort === "new_arrivals") {
                sortOption.newArrival = -1; // Show New Arrivals First
            }
    
            const tshirts = await db.collection("tshirts").find(filter).sort(sortOption).toArray();
            res.json(tshirts);
        } catch (err) {
            res.status(500).json({ error: "Error fetching T-shirts data" });
        }
    });
    app.get('/:category', async (req, res) => {
      try {
          const { category } = req.params;
          const { sort, minPrice, maxPrice, size, color, newArrival } = req.query;
  
          // Ensure category is valid
          const validCategories = ['men', 'women', 'tshirts', 'trousers', 'shirts'];
          if (!validCategories.includes(category)) {
              return res.status(400).json({ error: "Invalid category" });
          }
  
          let filter = {};
  
          // Price Range Filter
          if (minPrice && maxPrice) {
              filter.price = { $gte: parseInt(minPrice), $lte: parseInt(maxPrice) };
          }
  
          // Size Filter (checks if size exists in array)
          if (size) {
              filter.size = size;
          }
  
          // Color Filter (checks if color exists in array)
          if (color) {
              filter.color = color;
          }
  
          // New Arrival Filter
          if (newArrival) {
              filter.newArrival = newArrival === "true";
          }
  
          // Sorting Logic
          let sortOption = {};
          if (sort === "price_asc") {
              sortOption.price = 1; // Low to High
          } else if (sort === "price_desc") {
              sortOption.price = -1; // High to Low
          } else if (sort === "new_arrivals") {
              sortOption.newArrival = -1; // Show New Arrivals First
          }
  
          const collection = db.collection(category);
          const products = await collection.find(filter).sort(sortOption).toArray();
  
          res.json(products);
      } catch (err) {
          res.status(500).json({ error: "Error fetching products" });
      }
  });
  
      app.get('/api/:category', async (req, res) => {
        const category = req.params.category;
        try {
          const products = await db.collection(category).find().toArray();
          res.json(products);
        } catch (err) {
          res.status(500).json({ error: "Error fetching products", details: err.message });
        }
      });
      // Fetch product details by category and ID
      app.get('/api/:category/:productId', async (req, res) => {
        const { category, productId } = req.params;
        try {
          const product = await db.collection(category).findOne({ _id: new ObjectId(productId) });
          if (!product) {
            return res.status(404).json({ error: "Product not found" });
          }
          res.json(product);
        } catch (err) {
          res.status(500).json({ error: "Error fetching product", details: err.message });
        }
      });
      // Start the server
      app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
      });
    } catch (err) {
      console.error(err.stack);
      process.exit(1);
    }
  }

  main().catch(console.dir);