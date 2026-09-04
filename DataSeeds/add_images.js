const fs = require('fs');
const path = require('path');

const files = ['men.json', 'women.json', 'shirts.json', 'tshirts.json', 'trousers.json'];

const placeholderImages = [
  "https://images.unsplash.com/photo-1515347619362-7528e5c80521?auto=format&fit=crop&w=1260&q=80",
  "https://images.unsplash.com/photo-1550614000-4b95d466f212?auto=format&fit=crop&w=1260&q=80",
  "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1260&q=80",
  "https://images.unsplash.com/photo-1520975954732-57dd22299614?auto=format&fit=crop&w=1260&q=80"
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  try {
    let content = fs.readFileSync(filePath, 'utf16le');
    // If it doesn't parse, try utf8
    if (!content.trim().startsWith('[')) {
      content = fs.readFileSync(filePath, 'utf8');
    }
    
    // Remove BOM
    if (content.charCodeAt(0) === 0xFEFF) {
      content = content.slice(1);
    }
    
    const data = JSON.parse(content);
    
    const updatedData = data.map(product => {
      let images = Array.isArray(product.images) ? product.images : (product.image ? [product.image] : []);
      // Pad to 4 images
      while (images.length < 4) {
        images.push(placeholderImages[images.length]);
      }
      // If it's more than 4, slice it (or just keep them? Requirements say "4 photos inside")
      images = images.slice(0, 4);
      
      return {
        ...product,
        images,
        image: undefined // remove singular image property if it exists
      };
    });
    
    // Write back as UTF-8
    fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2), 'utf8');
    console.log(`Updated ${file} successfully with 4 images per product.`);
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
  }
});
