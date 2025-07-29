import { useState, useEffect } from 'react';
import {
  Box, Typography, Container, Grid, Card, CardContent, CardMedia,
  Button, IconButton, TextField, Chip, Divider, Paper, Avatar,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert
} from '@mui/material';
import { 
  FaTrash, FaPlus, FaMinus, FaShoppingCart, FaCreditCard, 
  FaHeart, FaLeaf, FaShieldAlt, FaArrowRight 
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // For demo purposes, we'll use localStorage to store cart items
      const savedCart = JSON.parse(localStorage.getItem('cartItems') || '[]');
      setCartItems(savedCart);
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Failed to load cart items');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    const updatedCart = cartItems.map(item =>
      item._id === itemId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedCart);
    localStorage.setItem('cartItems', JSON.stringify(updatedCart));
    toast.success('Quantity updated');
  };

  const removeFromCart = (itemId) => {
    const updatedCart = cartItems.filter(item => item._id !== itemId);
    setCartItems(updatedCart);
    localStorage.setItem('cartItems', JSON.stringify(updatedCart));
    toast.success('Item removed from cart');
  };

  const moveToWishlist = (item) => {
    // Add to wishlist
    const wishlist = JSON.parse(localStorage.getItem('wishlistItems') || '[]');
    const isAlreadyInWishlist = wishlist.some(wishItem => wishItem._id === item._id);
    
    if (!isAlreadyInWishlist) {
      wishlist.push({ ...item, quantity: 1 });
      localStorage.setItem('wishlistItems', JSON.stringify(wishlist));
      toast.success('Moved to wishlist');
    }
    
    // Remove from cart
    removeFromCart(item._id);
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateTax = () => {
    return calculateTotal() * 0.18; // 18% GST
  };

  const calculateGrandTotal = () => {
    return calculateTotal() + calculateTax() + 50; // 50 delivery charge
  };

  const handlePayment = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to proceed');
        navigate('/login');
        return;
      }

      // Demo payment processing
      toast.success('🎉 Payment Successful! This is a demo transaction.');
      
      // Clear cart after successful payment
      setCartItems([]);
      localStorage.removeItem('cartItems');
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
        <Typography>Loading cart...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" fontWeight={700} color="#2d5016" gutterBottom>
          <FaShoppingCart style={{ marginRight: 16 }} />
          Shopping Cart
        </Typography>
        <Typography variant="h6" color="text.secondary">
          {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart
        </Typography>
      </Box>

      {cartItems.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <FaShoppingCart size={64} color="#ccc" />
          <Typography variant="h5" color="text.secondary" mt={2} mb={2}>
            Your cart is empty
          </Typography>
          <Typography color="text.secondary" mb={4}>
            Discover our premium collection of Ayurvedic herbs
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
        <Grid container spacing={4}>
          {/* Cart Items */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              {cartItems.map((item, index) => (
                <Box key={item._id}>
                  <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} sm={3}>
                      <CardMedia
                        component="img"
                        height="120"
                        image={item.image || '/api/placeholder/120/120'}
                        alt={item.name}
                        sx={{ borderRadius: 2, objectFit: 'cover' }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
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
                        {item.description?.substring(0, 100)}...
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          startIcon={<FaHeart />}
                          onClick={() => moveToWishlist(item)}
                          sx={{ color: '#e91e63' }}
                        >
                          Move to Wishlist
                        </Button>
                        <Button
                          size="small"
                          startIcon={<FaTrash />}
                          onClick={() => removeFromCart(item._id)}
                          sx={{ color: '#f44336' }}
                        >
                          Remove
                        </Button>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={3}>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h6" fontWeight={700} color="#2d5016" mb={2}>
                          ₹{item.price}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mb: 2 }}>
                          <IconButton
                            size="small"
                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                            sx={{ border: '1px solid #ddd' }}
                          >
                            <FaMinus size={12} />
                          </IconButton>
                          <TextField
                            value={item.quantity}
                            size="small"
                            sx={{ 
                              width: 60, 
                              mx: 1,
                              '& input': { textAlign: 'center' }
                            }}
                            inputProps={{ min: 1, type: 'number' }}
                            onChange={(e) => updateQuantity(item._id, parseInt(e.target.value) || 1)}
                          />
                          <IconButton
                            size="small"
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            sx={{ border: '1px solid #ddd' }}
                          >
                            <FaPlus size={12} />
                          </IconButton>
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary">
                          Total: ₹{item.price * item.quantity}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  
                  {index < cartItems.length - 1 && <Divider sx={{ my: 3 }} />}
                </Box>
              ))}
            </Paper>
          </Grid>

          {/* Order Summary */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
              <Typography variant="h5" fontWeight={600} color="#2d5016" mb={3}>
                Order Summary
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Subtotal ({cartItems.length} items)</Typography>
                  <Typography>₹{calculateTotal().toFixed(2)}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>GST (18%)</Typography>
                  <Typography>₹{calculateTax().toFixed(2)}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Delivery Charges</Typography>
                  <Typography>₹50.00</Typography>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6" fontWeight={600}>Total Amount</Typography>
                  <Typography variant="h6" fontWeight={600} color="#2d5016">
                    ₹{calculateGrandTotal().toFixed(2)}
                  </Typography>
                </Box>
              </Box>
              
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<FaCreditCard />}
                onClick={() => setPaymentDialog(true)}
                sx={{ 
                  bgcolor: '#2d5016', 
                  '&:hover': { bgcolor: '#3a4d2d' },
                  py: 2,
                  fontSize: '1.1rem',
                  mb: 2
                }}
              >
                Proceed to Payment
              </Button>
              
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
                <FaShieldAlt color="#4caf50" />
                <Typography variant="body2" color="text.secondary">
                  Secure & Safe Payment
                </Typography>
              </Box>
              
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  🎯 <strong>Demo System:</strong> This is a demonstration. No real payment will be processed.
                </Typography>
              </Alert>
            </Paper>
          </Grid>
        </Grid>
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
            <Typography variant="h6" mb={2}>Order Total: ₹{calculateGrandTotal().toFixed(2)}</Typography>
            
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
            onClick={handlePayment}
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

export default Cart;