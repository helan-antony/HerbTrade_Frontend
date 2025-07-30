// Sample data for testing cart and wishlist functionality
export const sampleHerbs = [
  {
    _id: 'sample1',
    name: 'Organic Turmeric Powder',
    price: 299,
    image: '/assets/organic-turmeric.png',
    description: 'Premium organic turmeric powder with high curcumin content. Perfect for cooking and health benefits.',
    category: 'Spices',
    grade: 'A',
    quality: 'Organic',
    uses: ['Anti-inflammatory', 'Digestive Health', 'Immunity Booster'],
    inStock: 50,
    averageRating: 4.5,
    totalRatings: 128
  },
  {
    _id: 'sample2',
    name: 'Fresh Ginger Root',
    price: 199,
    image: '/assets/ginger.png',
    description: 'Fresh organic ginger root, perfect for teas, cooking, and natural remedies.',
    category: 'Roots',
    grade: 'A+',
    quality: 'Organic',
    uses: ['Digestive Aid', 'Nausea Relief', 'Anti-inflammatory'],
    inStock: 75,
    averageRating: 4.7,
    totalRatings: 95
  },
  {
    _id: 'sample3',
    name: 'Ashwagandha Powder',
    price: 599,
    image: 'https://images.unsplash.com/photo-1609501676725-7186f734b2e1?w=300&h=200&fit=crop',
    description: 'Pure Ashwagandha powder for stress relief and energy enhancement.',
    category: 'Herbs',
    grade: 'Premium',
    quality: 'Premium',
    uses: ['Stress Relief', 'Energy Booster', 'Sleep Aid'],
    inStock: 30,
    averageRating: 4.8,
    totalRatings: 156
  },
  {
    _id: 'sample4',
    name: 'Neem Leaves Powder',
    price: 249,
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop',
    description: 'Dried neem leaves powder for skin care and natural detox.',
    category: 'Leaves',
    grade: 'A',
    quality: 'Organic',
    uses: ['Skin Care', 'Blood Purifier', 'Immunity'],
    inStock: 40,
    averageRating: 4.3,
    totalRatings: 87
  }
];

export const addSampleDataToStorage = () => {
  // Add sample items to cart
  const sampleCartItems = [
    { ...sampleHerbs[0], quantity: 2 },
    { ...sampleHerbs[1], quantity: 1 }
  ];
  
  // Add sample items to wishlist
  const sampleWishlistItems = [
    sampleHerbs[2],
    sampleHerbs[0]
  ];
  
  localStorage.setItem('cartItems', JSON.stringify(sampleCartItems));
  localStorage.setItem('wishlistItems', JSON.stringify(sampleWishlistItems));
  
  // Also save in herbtradeCart format
  const herbtradeCart = sampleCartItems.map(item => ({
    product: item,
    quantity: item.quantity
  }));
  localStorage.setItem('herbtradeCart', JSON.stringify(herbtradeCart));
  localStorage.setItem('herbtradeWishlist', JSON.stringify(sampleWishlistItems));
  
  // Trigger count updates
  window.dispatchEvent(new Event('cartUpdated'));
  window.dispatchEvent(new Event('wishlistUpdated'));
  
  console.log('Sample data added to localStorage for testing');
};

export const clearSampleData = () => {
  localStorage.removeItem('cartItems');
  localStorage.removeItem('wishlistItems');
  localStorage.removeItem('herbtradeCart');
  localStorage.removeItem('herbtradeWishlist');
  
  // Trigger count updates
  window.dispatchEvent(new Event('cartUpdated'));
  window.dispatchEvent(new Event('wishlistUpdated'));
  
  console.log('Sample data cleared from localStorage');
};
