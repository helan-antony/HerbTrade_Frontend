import { useState, useEffect } from 'react';
import {
  Box, Typography, Container, Grid, Card, CardContent, CardMedia,
  Button, IconButton, Chip, Paper, Alert, Dialog, DialogTitle,
  DialogContent, DialogActions
} from '@mui/material';
import { 
  FaHeart, FaShoppingCart, FaTrash, FaCreditCard, FaLeaf,
  FaShieldAlt, FaArrowRight, FaHeartBroken 
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const navigate = useNavigate();

  useEffect(() => {
    fetchWishlistItems();
  }, []);

  const fetchWishlistItems = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // For demo purposes, we'll use localStorage to store wishlist items
      const savedWishlist = JSON.parse(localStorage.getItem('wishlistItems') || '[]');
      setWishlistItems(savedWishlist);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      toast.error('Failed to load wishlist items');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = (itemId) => {
    const updatedWishlist = wishlistItems.filter(item => item._id !== itemId);
    setWishlistItems(updatedWishlist);
    localStorage.setItem('wishlistItems', JSON.stringify(updatedWishlist));
    toast.success('Item removed from wishlist');
  };

  const moveToCart = (item) => {
    // Add to cart
    const cart = JSON.parse(localStorage.getItem('cartItems') || '[]');
    const existingItem = cart.find(cartItem => cartItem._id === item._id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...item, quantity: 1 });
    }
    
    localStorage.setItem('cartItems', JSON.stringify(cart));
    toast.success('Added to cart');
    
    // Remove from wishlist
    removeFromWishlist(item._id);
  };

  const toggleItemSelection = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const selectAllItems = () => {
    if (selectedItems.length === wishlistItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(wishlistItems.map(item => item._id));
    }
  };

  const moveSelectedToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cartItems') || '[]');
    
    selectedItems.forEach(itemId => {
      const item = wishlistItems.find(w => w._id === itemId);
      if (item) {
        const existingItem = cart.find(cartItem => cartItem._id === item._id);
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          cart.push({ ...item, quantity: 1 });
        }
      }
    });
    
    localStorage.setItem('cartItems', JSON.stringify(cart));
    
    // Remove selected items from wishlist
    const updatedWishlist = wishlistItems.filter(item => !selectedItems.includes(item._id));
    setWishlistItems(updatedWishlist);
    localStorage.setItem('wishlistItems', JSON.stringify(updatedWishlist));
    
    setSelectedItems([]);
    toast.success(`${selectedItems.length} items moved to cart`);
  };

  const calculateSelectedTotal = () => {
    return selectedItems.reduce((total, itemId) => {
      const item = wishlistItems.find(w => w._id === itemId);
      return total + (item ? item.price : 0);
    }, 0);
  };

  const handleDirectPayment = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to proceed');
        navigate('/login');
        return;
      }

      if (selectedItems.length === 0) {
        toast.error('Please select items to purchase');
        return;
      }

      // Demo payment processing
      toast.success('🎉 Payment Successful! This is a demo transaction.');
      
      // Remove purchased items from wishlist
      const updatedWishlist = wishlistItems.filter(item => !selectedItems.includes(item._id));
      setWishlistItems(updatedWishlist);
      localStorage.setItem('wishlistItems', JSON.stringify(updatedWishlist));
      
      setSelectedItems([]);
      setPaymentDialog(false);
      
      // Redirect to orders page
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
      
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Loading wishlist...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" fontWeight={700} color="#2d5016" gutterBottom>
          <FaHeart style={{ marginRight: 16, color: '#e91e63' }} />
          My Wishlist
        </Typography>
        <Typography variant="h6" color="text.secondary">
          {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} in your wishlist
        </Typography>
      </Box>

      {wishlistItems.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <FaHeartBroken size={64} color="#ccc" />
          <Typography variant="h5" color="text.secondary" mt={2} mb={2}>
            Your wishlist is empty
          </Typography>
          <Typography color="text.secondary" mb={4}>
            Save your favorite herbs for later
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/herbs')}
            sx={{ 
              bgcolor: '#2d5016', 
              '&:hover': { bgcolor: '#3a4d2d' },
              px: 4,
              py: 2
            }}
          >
            Browse Herbs
          </Button>
        </Paper>
      ) : (
        <>
          {/* Action Bar */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Button
                  variant="outlined"
                  onClick={selectAllItems}
                  size="small"
                >
                  {selectedItems.length === wishlistItems.length ? 'Deselect All' : 'Select All'}
                </Button>
                
                {selectedItems.length > 0 && (
                  <Typography variant="body2" color="text.secondary">
                    {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
                  </Typography>
                )}
              </Box>
              
              {selectedItems.length > 0 && (
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<FaShoppingCart />}
                    onClick={moveSelectedToCart}
                    sx={{ color: '#2d5016', borderColor: '#2d5016' }}
                  >
                    Move to Cart
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<FaCreditCard />}
                    onClick={() => setPaymentDialog(true)}
                    sx={{ bgcolor: '#2d5016', '&:hover': { bgcolor: '#3a4d2d' } }}
                  >
                    Buy Now (₹{calculateSelectedTotal()})
                  </Button>
                </Box>
              )}
            </Box>
          </Paper>

          {/* Wishlist Items */}
          <Grid container spacing={3}>
            {wishlistItems.map((item) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item._id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    border: selectedItems.includes(item._id) ? '2px solid #2d5016' : '1px solid #e0e0e0',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                    }
                  }}
                  onClick={() => toggleItemSelection(item._id)}
                >
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={item.image || '/api/placeholder/300/200'}
                      alt={item.name}
                    />
                    
                    <IconButton
                      sx={{ 
                        position: 'absolute', 
                        top: 8, 
                        right: 8,
                        bgcolor: 'rgba(255,255,255,0.9)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromWishlist(item._id);
                      }}
                    >
                      <FaTrash color="#f44336" size={16} />
                    </IconButton>
                    
                    {selectedItems.includes(item._id) && (
                      <Box sx={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        bgcolor: '#2d5016',
                        color: 'white',
                        borderRadius: '50%',
                        width: 24,
                        height: 24,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px'
                      }}>
                        ✓
                      </Box>
                    )}
                  </Box>
                  
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} color="#2d5016" mb={1}>
                      {item.name}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Chip 
                        label={item.category} 
                        size="small" 
                        sx={{ bgcolor: '#e8f5e8', color: '#2e7d32' }}
                      />
                      <Chip 
                        label={`Grade: ${item.grade || 'A'}`} 
                        size="small" 
                        variant="outlined"
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      {item.description?.substring(0, 80)}...
                    </Typography>
                    
                    <Typography variant="h6" fontWeight={700} color="#2d5016" mb={2}>
                      ₹{item.price}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<FaShoppingCart />}
                        onClick={(e) => {
                          e.stopPropagation();
                          moveToCart(item);
                        }}
                        sx={{ 
                          flex: 1,
                          color: '#2d5016', 
                          borderColor: '#2d5016',
                          '&:hover': { bgcolor: '#e8f5e8' }
                        }}
                      >
                        Add to Cart
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Payment Dialog */}
      <Dialog open={paymentDialog} onClose={() => setPaymentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h5" fontWeight={600}>
            Complete Payment
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Demo Payment System:</strong> This is a demonstration. No real money will be charged.
            </Typography>
          </Alert>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" mb={2}>
              Total for {selectedItems.length} items: ₹{calculateSelectedTotal().toFixed(2)}
            </Typography>
            
            <Typography variant="body1" mb={2}>Payment Method:</Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Button
                variant={paymentMethod === 'card' ? 'contained' : 'outlined'}
                onClick={() => setPaymentMethod('card')}
              >
                Credit/Debit Card
              </Button>
              <Button
                variant={paymentMethod === 'upi' ? 'contained' : 'outlined'}
                onClick={() => setPaymentMethod('upi')}
              >
                UPI
              </Button>
              <Button
                variant={paymentMethod === 'wallet' ? 'contained' : 'outlined'}
                onClick={() => setPaymentMethod('wallet')}
              >
                Wallet
              </Button>
            </Box>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setPaymentDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleDirectPayment}
            startIcon={<FaCreditCard />}
            sx={{ bgcolor: '#2d5016', '&:hover': { bgcolor: '#3a4d2d' } }}
          >
            Pay Now (Demo)
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Wishlist;