import { useState, useEffect } from 'react';
import {
  Box, Typography, Container, Grid, Card, CardContent, CardMedia,
  Button, IconButton, TextField, Paper, Alert, Dialog, DialogTitle,
  DialogContent, DialogActions, CircularProgress, Divider, Chip
} from '@mui/material';
import { 
  FaShoppingCart, FaTrash, FaCreditCard, FaPlus, FaMinus,
  FaHeart, FaShoppingBag, FaSync, FaArrowRight
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function EnhancedCart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [checkoutDialog, setCheckoutDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [shippingAddress, setShippingAddress] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCartItems(data.data.items || []);
      } else {
        throw new Error('Failed to fetch cart');
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Failed to load cart items');
      // Fallback to localStorage for demo
      const savedCart = JSON.parse(localStorage.getItem('cartItems') || '[]');
      setCartItems(savedCart.map(item => ({
        productId: { _id: item._id, ...item },
        quantity: item.quantity || 1,
        price: item.price,
        productName: item.name,
        productImage: item.image,
        productCategory: item.category
      })));
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/cart/update/${productId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity: newQuantity })
      });

      if (response.ok) {
        setCartItems(prev => prev.map(item => 
          item.productId._id === productId 
            ? { ...item, quantity: newQuantity }
            : item
        ));
      } else {
        throw new Error('Failed to update quantity');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      // Fallback to localStorage
      setCartItems(prev => prev.map(item => 
        item.productId._id === productId 
          ? { ...item, quantity: newQuantity }
          : item
      ));
      const updatedCart = cartItems.map(item => 
        item.productId._id === productId 
          ? { ...item.productId, quantity: newQuantity }
          : { ...item.productId, quantity: item.quantity }
      );
      localStorage.setItem('cartItems', JSON.stringify(updatedCart));
    } finally {
      setActionLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/cart/remove/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setCartItems(prev => prev.filter(item => item.productId._id !== productId));
        toast.success('Item removed from cart');
      } else {
        throw new Error('Failed to remove item');
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      // Fallback to localStorage
      const updatedCart = cartItems.filter(item => item.productId._id !== productId);
      setCartItems(updatedCart);
      const localCart = updatedCart.map(item => ({ ...item.productId, quantity: item.quantity }));
      localStorage.setItem('cartItems', JSON.stringify(localCart));
      toast.success('Item removed from cart');
    } finally {
      setActionLoading(false);
    }
  };

  const moveToWishlist = async (item) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/wishlist/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productId: item.productId._id })
      });

      if (response.ok) {
        await removeFromCart(item.productId._id);
        toast.success('Item moved to wishlist');
      } else {
        throw new Error('Failed to move to wishlist');
      }
    } catch (error) {
      console.error('Error moving to wishlist:', error);
      // Fallback to localStorage
      const wishlist = JSON.parse(localStorage.getItem('wishlistItems') || '[]');
      const existingItem = wishlist.find(w => w._id === item.productId._id);
      
      if (!existingItem) {
        wishlist.push(item.productId);
        localStorage.setItem('wishlistItems', JSON.stringify(wishlist));
      }
      
      removeFromCart(item.productId._id);
      toast.success('Item moved to wishlist');
    } finally {
      setActionLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/cart/clear', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setCartItems([]);
        toast.success('Cart cleared');
      } else {
        throw new Error('Failed to clear cart');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      // Fallback to localStorage
      setCartItems([]);
      localStorage.setItem('cartItems', JSON.stringify([]));
      toast.success('Cart cleared');
    } finally {
      setActionLoading(false);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const handleCheckout = async () => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to proceed');
        navigate('/login');
        return;
      }

      if (cartItems.length === 0) {
        toast.error('Your cart is empty');
        return;
      }

      if (!shippingAddress.trim()) {
        toast.error('Please enter shipping address');
        return;
      }

      // Demo checkout processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('🎉 Order placed successfully! This is a demo transaction.');
      
      // Clear cart after successful checkout
      await clearCart();
      setCheckoutDialog(false);
      
      // Redirect to orders page
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
      
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Checkout failed. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} sx={{ color: '#2d5016' }} />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading your cart...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h3" fontWeight={700} color="#2d5016" gutterBottom>
            <FaShoppingCart style={{ marginRight: 16, color: '#2d5016' }} />
            Shopping Cart
          </Typography>
          <Typography variant="h6" color="text.secondary">
            {calculateTotalItems()} item{calculateTotalItems() !== 1 ? 's' : ''} in your cart
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<FaSync />}
            onClick={fetchCartItems}
            disabled={loading}
            sx={{ color: '#2d5016', borderColor: '#2d5016' }}
          >
            Refresh
          </Button>
          
          {cartItems.length > 0 && (
            <Button
              variant="outlined"
              startIcon={<FaTrash />}
              onClick={clearCart}
              disabled={actionLoading}
              sx={{ color: '#f44336', borderColor: '#f44336' }}
            >
              Clear Cart
            </Button>
          )}
        </Box>
      </Box>

      {cartItems.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <FaShoppingBag size={64} color="#ccc" />
          <Typography variant="h5" color="text.secondary" mt={2} mb={2}>
            Your cart is empty
          </Typography>
          <Typography color="text.secondary" mb={4}>
            Add some herbs to get started
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
              <Typography variant="h5" fontWeight={600} mb={3}>
                Cart Items ({cartItems.length})
              </Typography>
              
              {cartItems.map((item) => (
                <Box key={item.productId._id} sx={{ mb: 3 }}>
                  <Card sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                    <CardMedia
                      component="img"
                      sx={{ width: 120, height: 120, borderRadius: 2 }}
                      image={item.productImage || '/api/placeholder/120/120'}
                      alt={item.productName}
                    />
                    
                    <CardContent sx={{ flex: 1, ml: 2 }}>
                      <Typography variant="h6" fontWeight={600} color="#2d5016" mb={1}>
                        {item.productName}
                      </Typography>
                      
                      <Chip 
                        label={item.productCategory} 
                        size="small" 
                        sx={{ bgcolor: '#e8f5e8', color: '#2e7d32', mb: 2 }}
                      />
                      
                      <Typography variant="h6" fontWeight={700} color="#2d5016" mb={2}>
                        ₹{item.price} each
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => updateQuantity(item.productId._id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || actionLoading}
                            sx={{ bgcolor: '#f5f5f5' }}
                          >
                            <FaMinus size={12} />
                          </IconButton>
                          
                          <TextField
                            size="small"
                            value={item.quantity}
                            onChange={(e) => {
                              const newQuantity = parseInt(e.target.value) || 1;
                              updateQuantity(item.productId._id, newQuantity);
                            }}
                            sx={{ width: 60 }}
                            inputProps={{ min: 1, style: { textAlign: 'center' } }}
                          />
                          
                          <IconButton
                            size="small"
                            onClick={() => updateQuantity(item.productId._id, item.quantity + 1)}
                            disabled={actionLoading}
                            sx={{ bgcolor: '#f5f5f5' }}
                          >
                            <FaPlus size={12} />
                          </IconButton>
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary">
                          Subtotal: ₹{(item.price * item.quantity).toFixed(2)}
                        </Typography>
                      </Box>
                    </CardContent>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, ml: 2 }}>
                      <IconButton
                        onClick={() => moveToWishlist(item)}
                        disabled={actionLoading}
                        sx={{ color: '#e91e63' }}
                      >
                        <FaHeart />
                      </IconButton>
                      
                      <IconButton
                        onClick={() => removeFromCart(item.productId._id)}
                        disabled={actionLoading}
                        sx={{ color: '#f44336' }}
                      >
                        <FaTrash />
                      </IconButton>
                    </Box>
                  </Card>
                </Box>
              ))}
            </Paper>
          </Grid>
          
          {/* Order Summary */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
              <Typography variant="h5" fontWeight={600} mb={3}>
                Order Summary
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Items ({calculateTotalItems()})</Typography>
                  <Typography>₹{calculateTotal().toFixed(2)}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Shipping</Typography>
                  <Typography color="green">FREE</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Tax</Typography>
                  <Typography>₹{(calculateTotal() * 0.18).toFixed(2)}</Typography>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6" fontWeight={600}>Total</Typography>
                  <Typography variant="h6" fontWeight={600} color="#2d5016">
                    ₹{(calculateTotal() * 1.18).toFixed(2)}
                  </Typography>
                </Box>
              </Box>
              
              <Button
                variant="contained"
                fullWidth
                size="large"
                startIcon={<FaCreditCard />}
                onClick={() => setCheckoutDialog(true)}
                disabled={actionLoading}
                sx={{ 
                  bgcolor: '#2d5016', 
                  '&:hover': { bgcolor: '#3a4d2d' },
                  py: 2,
                  mb: 2
                }}
              >
                Proceed to Checkout
              </Button>
              
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/herbs')}
                sx={{ color: '#2d5016', borderColor: '#2d5016' }}
              >
                Continue Shopping
              </Button>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Checkout Dialog */}
      <Dialog open={checkoutDialog} onClose={() => setCheckoutDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h5" fontWeight={600}>
            Checkout
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Demo Checkout System:</strong> This is a demonstration. No real money will be charged.
            </Typography>
          </Alert>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" mb={2}>Order Summary</Typography>
              <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 2 }}>
                <Typography variant="body2" mb={1}>
                  Items: {calculateTotalItems()}
                </Typography>
                <Typography variant="body2" mb={1}>
                  Subtotal: ₹{calculateTotal().toFixed(2)}
                </Typography>
                <Typography variant="body2" mb={1}>
                  Tax (18%): ₹{(calculateTotal() * 0.18).toFixed(2)}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="h6" fontWeight={600}>
                  Total: ₹{(calculateTotal() * 1.18).toFixed(2)}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" mb={2}>Payment & Shipping</Typography>
              
              <Typography variant="body1" mb={2}>Payment Method:</Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                <Button
                  variant={paymentMethod === 'card' ? 'contained' : 'outlined'}
                  onClick={() => setPaymentMethod('card')}
                  size="small"
                >
                  Credit Card
                </Button>
                <Button
                  variant={paymentMethod === 'upi' ? 'contained' : 'outlined'}
                  onClick={() => setPaymentMethod('upi')}
                  size="small"
                >
                  UPI
                </Button>
                <Button
                  variant={paymentMethod === 'cod' ? 'contained' : 'outlined'}
                  onClick={() => setPaymentMethod('cod')}
                  size="small"
                >
                  Cash on Delivery
                </Button>
              </Box>
              
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Shipping Address"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="Enter your complete shipping address..."
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setCheckoutDialog(false)}
            disabled={actionLoading}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleCheckout}
            disabled={actionLoading || !shippingAddress.trim()}
            startIcon={actionLoading ? <CircularProgress size={20} color="inherit" /> : <FaArrowRight />}
            sx={{ bgcolor: '#2d5016', '&:hover': { bgcolor: '#3a4d2d' } }}
          >
            {actionLoading ? 'Processing...' : 'Place Order'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default EnhancedCart;