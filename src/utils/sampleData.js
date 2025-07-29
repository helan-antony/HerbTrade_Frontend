// Sample data for testing cart and wishlist functionality
export const sampleHerbs = [
  {
    _id: 'sample1',
    name: 'Organic Turmeric Powder',
    price: 299,
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=300&h=200&fit=crop',
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
    name: 'Ashwagandha Root Extract',
    price: 599,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=200&fit=crop',
    description: 'Pure Ashwagandha root extract capsules for stress relief and energy enhancement.',
    category: 'Ayurvedic Herbs',
    grade: 'Premium',
    quality: 'Premium',
    uses: ['Stress Relief', 'Energy Booster', 'Sleep Support'],
    inStock: 25,
    averageRating: 4.8,
    totalRatings: 89
  },
  {
    _id: 'sample3',
    name: 'Neem Leaves Powder',
    price: 199,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop',
    description: 'Natural neem leaves powder for skin care and blood purification.',
    category: 'Medicinal Herbs',
    grade: 'A',
    quality: 'Organic',
    uses: ['Skin Care', 'Blood Purifier', 'Antibacterial'],
    inStock: 35,
    averageRating: 4.2,
    totalRatings: 67
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
  
  console.log('Sample data added to localStorage for testing');
};

export const clearSampleData = () => {
  localStorage.removeItem('cartItems');
  localStorage.removeItem('wishlistItems');
  localStorage.removeItem('herbtradeCart');
  localStorage.removeItem('herbtradeWishlist');
  console.log('Sample data cleared from localStorage');
};