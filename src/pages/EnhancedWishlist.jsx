import { useState, useEffect } from 'react';
import {
  Box, Typography, Container, Grid, Card, CardContent, CardMedia,
  Button, IconButton, Chip, Paper, Alert, Dialog, DialogTitle,
  DialogContent, DialogActions, CircularProgress, Snackbar
} from '@mui/material';
import { 
  FaHeart, FaShoppingCart, FaTrash, FaCreditCard, FaLeaf,
  FaShieldAlt, FaArrowRight, FaHeartBroken, FaSync 
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function EnhancedWishlist() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const navigate = useNavigate();

  useEffect(() => {
    fetchWishlistItems();
  }, []);

  const fetchWishlistItems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/wishlist', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setWishlistItems(data.data.items || []);
      } else {
        throw new Error('Failed to fetch wishlist');
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      toast.error('Failed to load wishlist items');
      // Fallback to localStorage for demo
      const savedWishlist = JSON.parse(localStorage.getItem('wishlistItems') || '[]');
      setWishlistItems(savedWishlist);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/wishlist/remove/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setWishlistItems(prev => prev.filter(item => item.productId._id !== productId));
        toast.success('Item removed from wishlist');
      } else {
        throw new Error('Failed to remove item');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      // Fallback to localStorage
      const updatedWishlist = wishlistItems.filter(item => item.productId._id !== productId);
      setWishlistItems(updatedWishlist);
      localStorage.setItem('wishlistItems', JSON.stringify(updatedWishlist));
      toast.success('Item removed from wishlist');
    } finally {
      setActionLoading(false);
    }
  };

  const addToCart = async (item) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/cart/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: item.productId._id,
          quantity: 1
        })
      });

      if (response.ok) {
        toast.success('Added to cart');
        // Optionally remove from wishlist after adding to cart
        await removeFromWishlist(item.productId._id);
      } else {
        throw new Error('Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      // Fallback to localStorage
      const cart = JSON.parse(localStorage.getItem('cartItems') || '[]');
      const existingItem = cart.find(cartItem => cartItem._id === item.productId._id);
      
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({ ...item.productId, quantity: 1 });
      }
      
      localStorage.setItem('cartItems', JSON.stringify(cart));
      toast.success('Added to cart');
      removeFromWishlist(item.productId._id);
    } finally {
      setActionLoading(false);
    }
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
      setSelectedItems(wishlistItems.map(item => item.productId._id));
    }
  };

  const moveSelectedToCart = async () => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      
      for (const itemId of selectedItems) {
        const item = wishlistItems.find(w => w.productId._id === itemId);
        if (item) {
          await fetch('http://localhost:5000/api/cart/add', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              productId: item.productId._id,
              quantity: 1
            })
          });
        }
      }
      
      // Remove selected items from wishlist
      for (const itemId of selectedItems) {
        await removeFromWishlist(itemId);
      }
      
      setSelectedItems([]);
      toast.success(`${selectedItems.length} items moved to cart`);
    } catch (error) {
      console.error('Error moving items to cart:', error);
      toast.error('Failed to move items to cart');
    } finally {
      setActionLoading(false);
    }
  };

  const calculateSelectedTotal = () => {
    return selectedItems.reduce((total, itemId) => {
      const item = wishlistItems.find(w => w.productId._id === itemId);
      return total + (item ? item.productPrice : 0);
    }, 0);
  };

  const handleDirectPayment = async () => {
    try {
      setActionLoading(true);
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
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('🎉 Payment Successful! This is a demo transaction.');
      
      // Remove purchased items from wishlist
      for (const itemId of selectedItems) {
        await removeFromWishlist(itemId);
      }
      
      setSelectedItems([]);
      setPaymentDialog(false);
      
      // Redirect to orders page
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
      
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} sx={{ color: '#2d5016' }} />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading your wishlist...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h3" fontWeight={700} color="#2d5016" gutterBottom>
            <FaHeart style={{ marginRight: 16, color: '#e91e63' }} />
            My Wishlist
          </Typography>
          <Typography variant="h6" color="text.secondary">
            {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} in your wishlist
          </Typography>
        </Box>
        
        <Button
          variant="outlined"
          startIcon={<FaSync />}
          onClick={fetchWishlistItems}
          disabled={loading}
          sx={{ color: '#2d5016', borderColor: '#2d5016' }}
        >
          Refresh
        </Button>
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
                  disabled={actionLoading}
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
                    disabled={actionLoading}
                    sx={{ color: '#2d5016', borderColor: '#2d5016' }}
                  >
                    {actionLoading ? <CircularProgress size={20} /> : 'Move to Cart'}
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<FaCreditCard />}
                    onClick={() => setPaymentDialog(true)}
                    disabled={actionLoading}
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
              <Grid item xs={12} sm={6} md={4} lg={3} key={item.productId._id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    border: selectedItems.includes(item.productId._id) ? '2px solid #2d5016' : '1px solid #e0e0e0',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                    }
                  }}
                  onClick={() => toggleItemSelection(item.productId._id)}
                >
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={item.productImage || '/api/placeholder/300/200'}
                      alt={item.productName}
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
                        removeFromWishlist(item.productId._id);
                      }}
                      disabled={actionLoading}
                    >
                      <FaTrash color="#f44336" size={16} />
                    </IconButton>
                    
                    {selectedItems.includes(item.productId._id) && (
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
                      {item.productName}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Chip 
                        label={item.productCategory} 
                        size="small" 
                        sx={{ bgcolor: '#e8f5e8', color: '#2e7d32' }}
                      />
                      <Chip 
                        label="Premium" 
                        size="small" 
                        variant="outlined"
                      />
                    </Box>
                    
                    <Typography variant="h6" fontWeight={700} color="#2d5016" mb={2}>
                      ₹{item.productPrice}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<FaShoppingCart />}
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(item);
                        }}
                        disabled={actionLoading}
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
                sx={{ flex: 1 }}
              >
                Credit Card
              </Button>
              <Button
                variant={paymentMethod === 'upi' ? 'contained' : 'outlined'}
                onClick={() => setPaymentMethod('upi')}
                sx={{ flex: 1 }}
              >
                UPI
              </Button>
              <Button
                variant={paymentMethod === 'wallet' ? 'contained' : 'outlined'}
                onClick={() => setPaymentMethod('wallet')}
                sx={{ flex: 1 }}
              >
                Wallet
              </Button>
            </Box>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setPaymentDialog(false)}
            disabled={actionLoading}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleDirectPayment}
            disabled={actionLoading}
            sx={{ bgcolor: '#2d5016', '&:hover': { bgcolor: '#3a4d2d' } }}
          >
            {actionLoading ? <CircularProgress size={20} color="inherit" /> : 'Pay Now'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default EnhancedWishlist;