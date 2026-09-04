const fs = require('fs');
const path = require('path');

const SEED_DIR = path.join(__dirname);
const files = ['men.json', 'women.json', 'tshirts.json', 'shirts.json', 'trousers.json'];

// Helper to shuffle array
function shuffle(array) {
  let currentIndex = array.length,  randomIndex;
  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

const adjectives = ['Premium', 'Classic', 'Modern', 'Essential', 'Signature', 'Luxe', 'Tailored', 'Heritage'];
const variations = [
  { prefix: 'Premium', priceMult: 1.2 },
  { prefix: 'Classic', priceMult: 1.0 },
  { prefix: 'Modern', priceMult: 1.1 },
  { prefix: 'Signature', priceMult: 1.3 }
];

files.forEach(file => {
  const filePath = path.join(SEED_DIR, file);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${file}, not found.`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  // Strip BOM if present
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  
  let products = JSON.parse(content);
  let newProducts = [...products];

  products.forEach(product => {
    // Make 2 variations of each product
    const vars = shuffle([...variations]).slice(0, 2);
    
    vars.forEach(v => {
      let clone = JSON.parse(JSON.stringify(product));
      clone.name = `${v.prefix} ${clone.name.replace(/^(Premium|Classic|Modern|Essential|Signature|Luxe|Tailored|Heritage)\s/i, '')}`;
      clone.price = Math.round(clone.price * v.priceMult);
      if (clone.originalPrice) {
        clone.originalPrice = Math.round(clone.originalPrice * v.priceMult);
      }
      clone.inStock = true; // explicitly add inStock
      // Add standard sizes if missing to make it more rich
      if (!clone.size || clone.size.length === 0) {
        clone.size = ["S", "M", "L", "XL"];
      }
      
      // slightly change the rating
      clone.rating = Math.min(5, (clone.rating + (Math.random() * 0.4 - 0.2)).toFixed(1));
      clone.ratingCount = Math.floor(clone.ratingCount * (0.8 + Math.random() * 0.4));
      
      newProducts.push(clone);
    });
    
    // Also update the original product's inStock status to true
    product.inStock = true;
  });

  fs.writeFileSync(filePath, JSON.stringify(newProducts, null, 2), 'utf8');
  console.log(`Expanded ${file}: ${products.length} -> ${newProducts.length} products`);
});
