import { 
  Box, Typography, Grid, Card, CardContent, CardMedia, TextField, Button, 
  Chip, Rating, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, Snackbar, Alert, Badge,
  IconButton, Drawer, List, ListItem, ListItemText, Divider
} from "@mui/material";
import { 
  FaSearch, FaShoppingBasket, FaFilter, FaStar, FaHeart, 
  FaShoppingCart, FaPlus, FaMinus, FaTimes 
} from "react-icons/fa";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function HerbCatalog() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productDialog, setProductDialog] = useState(false);
  const [cart, setCart] = useState([]);
  const [cartDrawer, setCartDrawer] = useState(false);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    loadCartFromStorage();
    loadWishlistFromStorage();
  }, [search, selectedCategory, sortBy]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedCategory) params.append('category', selectedCategory);
      if (sortBy) params.append('sort', sortBy);

      const response = await axios.get(`http://localhost:5000/api/products?${params}`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products/categories/list');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const loadCartFromStorage = () => {
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      // Convert old format to new format
      const cartData = JSON.parse(savedCart);
      if (cartData.length > 0 && cartData[0].product) {
        // Old format with product wrapper
        setCart(cartData);
      } else {
        // New format - convert to old format for compatibility
        const convertedCart = cartData.map(item => ({
          product: item,
          quantity: item.quantity || 1
        }));
        setCart(convertedCart);
      }
    }
  };

  const loadWishlistFromStorage = () => {
    const savedWishlist = localStorage.getItem('wishlistItems');
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist));
    }
  };

  const saveCartToStorage = (newCart) => {
    // Save in both formats for compatibility
    localStorage.setItem('herbtradeCart', JSON.stringify(newCart));
    // Also save in the format expected by Cart page
    const cartItems = newCart.map(item => ({
      ...item.product,
      quantity: item.quantity
    }));
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  };

  const saveWishlistToStorage = (newWishlist) => {
    localStorage.setItem('herbtradeWishlist', JSON.stringify(newWishlist));
    localStorage.setItem('wishlistItems', JSON.stringify(newWishlist));
  };

  const addToCart = (product, quantity = 1) => {
    const existingItem = cart.find(item => item.product._id === product._id);
    let newCart;

    if (existingItem) {
      newCart = cart.map(item =>
        item.product._id === product._id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      newCart = [...cart, { product, quantity }];
    }

    setCart(newCart);
    saveCartToStorage(newCart);
    toast.success(`${product.name} added to cart!`);
  };

  const removeFromCart = (productId) => {
    const newCart = cart.filter(item => item.product._id !== productId);
    setCart(newCart);
    saveCartToStorage(newCart);
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const newCart = cart.map(item =>
      item.product._id === productId
        ? { ...item, quantity }
        : item
    );
    setCart(newCart);
    saveCartToStorage(newCart);
  };

  const toggleWishlist = (product) => {
    const isInWishlist = wishlist.some(item => item._id === product._id);
    let newWishlist;

    if (isInWishlist) {
      newWishlist = wishlist.filter(item => item._id !== product._id);
      toast.info(`${product.name} removed from wishlist`);
    } else {
      newWishlist = [...wishlist, product];
      toast.success(`${product.name} added to wishlist!`);
    }

    setWishlist(newWishlist);
    saveWishlistToStorage(newWishlist);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setProductDialog(true);
  };

  const getQualityColor = (quality) => {
    switch (quality) {
      case 'Organic': return '#4caf50';
      case 'Premium': return '#ff9800';
      default: return '#2196f3';
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", p: 3, bgcolor: "#f8f6f0" }}>
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700} color="#3a4d2d" fontFamily="serif">
          Herb Catalog 🌿
        </Typography>
        <IconButton onClick={() => setCartDrawer(true)} sx={{ color: '#3a4d2d' }}>
          <Badge badgeContent={getCartItemCount()} color="error">
            <FaShoppingCart size={24} />
          </Badge>
        </IconButton>
      </Box>

      {/* Search and Filters */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search herbs (e.g. turmeric for inflammation)"
              value={search}
              onChange={e => setSearch(e.target.value)}
              InputProps={{ 
                startAdornment: <FaSearch style={{ marginRight: 8, color: '#3a4d2d' }} /> 
              }}
              sx={{ 
                bgcolor: "white", 
                borderRadius: 2,
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: '#3a4d2d' },
                  '&.Mui-focused fieldset': { borderColor: '#3a4d2d' }
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                sx={{ bgcolor: 'white' }}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map(category => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                sx={{ bgcolor: 'white' }}
              >
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="price_low">Price: Low to High</MenuItem>
                <MenuItem value="price_high">Price: High to Low</MenuItem>
                <MenuItem value="rating">Highest Rated</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* Products Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <Typography>Loading products...</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {products.map(product => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  bgcolor: "white", 
                  borderRadius: 3,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                  }
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <CardMedia 
                    component="img" 
                    height="200" 
                    image={product.image} 
                    alt={product.name}
                    sx={{ objectFit: "cover", cursor: 'pointer' }}
                    onClick={() => handleProductClick(product)}
                  />
                  <IconButton
                    sx={{ 
                      position: 'absolute', 
                      top: 8, 
                      right: 8, 
                      bgcolor: 'rgba(255,255,255,0.9)',
                      color: wishlist.some(item => item._id === product._id) ? '#e91e63' : '#666'
                    }}
                    onClick={() => toggleWishlist(product)}
                  >
                    <FaHeart />
                  </IconButton>
                  <Chip
                    label={product.quality}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      bgcolor: getQualityColor(product.quality),
                      color: 'white',
                      fontWeight: 600
                    }}
                  />
                </Box>
                
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography 
                    variant="h6" 
                    fontWeight={600} 
                    sx={{ mb: 1, cursor: 'pointer' }}
                    onClick={() => handleProductClick(product)}
                  >
                    {product.name}
                  </Typography>
                  
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ mb: 2, flexGrow: 1 }}
                  >
                    {product.description.substring(0, 100)}...
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Rating value={product.averageRating || 0} readOnly size="small" />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      ({product.totalRatings || 0})
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                    {product.uses.slice(0, 2).map(use => (
                      <Chip key={use} label={use} size="small" variant="outlined" />
                    ))}
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight={700} color="#2e7d32">
                      ₹{product.price}
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<FaShoppingBasket />}
                      onClick={() => addToCart(product)}
                      sx={{
                        bgcolor: "#3a4d2d",
                        '&:hover': { bgcolor: "#2d3d22" }
                      }}
                    >
                      Add to Cart
                    </Button>
                  </Box>

                  {product.inStock < 10 && (
                    <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                      Only {product.inStock} left in stock!
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Product Detail Dialog */}
      <Dialog 
        open={productDialog} 
        onClose={() => setProductDialog(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedProduct && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5" fontWeight={600}>
                {selectedProduct.name}
              </Typography>
              <IconButton onClick={() => setProductDialog(false)}>
                <FaTimes />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <img 
                    src={selectedProduct.image} 
                    alt={selectedProduct.name}
                    style={{ width: '100%', borderRadius: 8 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h4" color="#2e7d32" fontWeight={700} sx={{ mb: 2 }}>
                    ₹{selectedProduct.price}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Rating value={selectedProduct.averageRating || 0} readOnly />
                    <Typography sx={{ ml: 1 }}>
                      ({selectedProduct.totalRatings || 0} reviews)
                    </Typography>
                  </Box>

                  <Chip
                    label={selectedProduct.quality}
                    sx={{
                      bgcolor: getQualityColor(selectedProduct.quality),
                      color: 'white',
                      mb: 2
                    }}
                  />

                  <Typography variant="body1" sx={{ mb: 3 }}>
                    {selectedProduct.description}
                  </Typography>

                  <Typography variant="h6" sx={{ mb: 1 }}>Uses:</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                    {selectedProduct.uses.map(use => (
                      <Chip key={use} label={use} variant="outlined" />
                    ))}
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Stock: {selectedProduct.inStock} units available
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => toggleWishlist(selectedProduct)} startIcon={<FaHeart />}>
                {wishlist.some(item => item._id === selectedProduct._id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </Button>
              <Button 
                variant="contained" 
                onClick={() => {
                  addToCart(selectedProduct);
                  setProductDialog(false);
                }}
                startIcon={<FaShoppingBasket />}
                sx={{ bgcolor: "#3a4d2d" }}
              >
                Add to Cart
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Cart Drawer */}
      <Drawer
        anchor="right"
        open={cartDrawer}
        onClose={() => setCartDrawer(false)}
        sx={{ '& .MuiDrawer-paper': { width: 400, p: 2 } }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Shopping Cart ({getCartItemCount()})</Typography>
          <IconButton onClick={() => setCartDrawer(false)}>
            <FaTimes />
          </IconButton>
        </Box>
        
        <Divider sx={{ mb: 2 }} />

        {cart.length === 0 ? (
          <Typography color="text.secondary" textAlign="center" sx={{ py: 4 }}>
            Your cart is empty
          </Typography>
        ) : (
          <>
            <List>
              {cart.map(item => (
                <ListItem key={item.product._id} sx={{ px: 0 }}>
                  <Box sx={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                    <img 
                      src={item.product.image} 
                      alt={item.product.name}
                      style={{ width: 60, height: 60, borderRadius: 4, marginRight: 12 }}
                    />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" fontWeight={600}>
                        {item.product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ₹{item.product.price} each
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <IconButton 
                          size="small" 
                          onClick={() => updateCartQuantity(item.product._id, item.quantity - 1)}
                        >
                          <FaMinus />
                        </IconButton>
                        <Typography sx={{ mx: 1 }}>{item.quantity}</Typography>
                        <IconButton 
                          size="small" 
                          onClick={() => updateCartQuantity(item.product._id, item.quantity + 1)}
                        >
                          <FaPlus />
                        </IconButton>
                      </Box>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" fontWeight={600}>
                        ₹{item.product.price * item.quantity}
                      </Typography>
                      <IconButton 
                        size="small" 
                        onClick={() => removeFromCart(item.product._id)}
                        sx={{ color: 'error.main' }}
                      >
                        <FaTimes />
                      </IconButton>
                    </Box>
                  </Box>
                </ListItem>
              ))}
            </List>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Total:</Typography>
              <Typography variant="h6" color="#2e7d32" fontWeight={700}>
                ₹{getCartTotal()}
              </Typography>
            </Box>
            
            <Button 
              variant="contained" 
              fullWidth 
              size="large"
              sx={{ bgcolor: "#3a4d2d" }}
              onClick={() => {
                toast.success('Proceeding to checkout...');
                // Add checkout logic here
              }}
            >
              Proceed to Checkout
            </Button>
          </>
        )}
      </Drawer>
    </Box>
  );
}

export default HerbCatalog; 