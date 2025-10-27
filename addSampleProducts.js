const axios = require('axios');

const sampleProducts = [
  // Electronics
  {
    name: "Smartphone",
    description: "Latest model smartphone with high-end features",
    price: 699.99,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500",
    stock: 50,
    category: "Electronics"
  },
  {
    name: "Laptop",
    description: "Powerful laptop for work and gaming",
    price: 1299.99,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500",
    stock: 30,
    category: "Electronics"
  },
  {
    name: "Wireless Headphones",
    description: "Premium wireless headphones with noise cancellation",
    price: 199.99,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
    stock: 100,
    category: "Electronics"
  },
  {
    name: "Smart Watch",
    description: "Feature-rich smartwatch with health tracking",
    price: 299.99,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
    stock: 45,
    category: "Electronics"
  },
  // Clothing
  {
    name: "Men's T-Shirt",
    description: "Comfortable cotton t-shirt for everyday wear",
    price: 24.99,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
    stock: 200,
    category: "Clothing"
  },
  {
    name: "Women's Dress",
    description: "Elegant summer dress",
    price: 49.99,
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500",
    stock: 75,
    category: "Clothing"
  },
  // Home & Kitchen
  {
    name: "Coffee Maker",
    description: "Programmable coffee maker with thermal carafe",
    price: 89.99,
    image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500",
    stock: 40,
    category: "Home & Kitchen"
  },
  {
    name: "Blender",
    description: "High-performance blender for smoothies and more",
    price: 79.99,
    image: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=500",
    stock: 35,
    category: "Home & Kitchen"
  },
  // Books
  {
    name: "Programming Book",
    description: "Comprehensive guide to modern programming",
    price: 39.99,
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500",
    stock: 60,
    category: "Books"
  },
  {
    name: "Novel",
    description: "Bestselling fiction novel",
    price: 19.99,
    image: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=500",
    stock: 85,
    category: "Books"
  },
  // Sports
  {
    name: "Running Shoes",
    description: "Lightweight running shoes with cushioning",
    price: 89.99,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
    stock: 55,
    category: "Sports"
  },
  {
    name: "Yoga Mat",
    description: "Non-slip yoga mat with carrying strap",
    price: 29.99,
    image: "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=500",
    stock: 90,
    category: "Sports"
  }
];

const addProduct = async (product) => {
  try {
    console.log(`\nAttempting to add product: ${product.name}`);
    
    const response = await axios.post('http://localhost:5000/api/products', product, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 201) {
      console.log(`✓ Successfully added: ${response.data.name}`);
      return true;
    } else {
      console.log(`× Failed to add ${product.name}: Unexpected status ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error(`× Error adding ${product.name}:`);
    if (error.response) {
      console.error('  Response error:', {
        status: error.response.status,
        data: error.response.data
      });
    } else if (error.request) {
      console.error('  Request error - no response received');
    } else {
      console.error('  Error:', error.message);
    }
    return false;
  }
};

const addAllProducts = async () => {
  console.log('Starting to add all products...\n');
  
  let successful = 0;
  let failed = 0;
  
  for (const product of sampleProducts) {
    const success = await addProduct(product);
    if (success) {
      successful++;
    } else {
      failed++;
    }
  }
  
  console.log(`\nProcess completed:`);
  console.log(`✓ Successfully added: ${successful} products`);
  console.log(`× Failed to add: ${failed} products`);
};

addAllProducts()
  .catch(error => console.error('Unhandled error:', error)); 