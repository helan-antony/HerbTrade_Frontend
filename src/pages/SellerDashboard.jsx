import { useState, useEffect } from "react";
import { 
  Box, Typography, Grid, Card, CardContent, Button, Table, 
  TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Select, FormControl, InputLabel, Avatar
} from "@mui/material";
import { 
  TrendingUp, Inventory, ShoppingCart, AttachMoney, 
  Add, Visibility, Edit, LocalShipping
} from '@mui/icons-material';

const SellerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [openProductDialog, setOpenProductDialog] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '', category: '', price: '', stock: '', description: '', image: ''
  });

  useEffect(() => {
    fetchSellerData();
  }, []);

  const fetchSellerData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [productsRes, ordersRes, statsRes] = await Promise.all([
        fetch('http://localhost:5000/api/seller/products', { headers }),
        fetch('http://localhost:5000/api/seller/orders', { headers }),
        fetch('http://localhost:5000/api/seller/stats', { headers })
      ]);

      setProducts(await productsRes.json());
      setOrders(await ordersRes.json());
      setStats(await statsRes.json());
    } catch (error) {
      console.error('Failed to fetch seller data:', error);
    }
  };

  const StatCard = ({ title, value, change, icon, color }) => (
    <Grid item xs={12} sm={6} md={3}>
      <Card className="hover-lift" sx={{ 
        borderRadius: 3, 
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
        color: 'white'
      }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>{title}</Typography>
              <Typography variant="h4" fontWeight={700}>{value}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>{change}</Typography>
            </Box>
            <Box sx={{
              width: 56, height: 56, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: 'rgba(255,255,255,0.2)'
            }}>
              {icon}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );

  return (
    <Box sx={{ p: 4, bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      <Typography variant="h4" fontWeight={700} mb={4} className="gradient-text">
        Seller Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <StatCard 
          title="Total Sales" 
          value={`$${stats.totalSales || '0'}`} 
          change="+12.5% from last month" 
          icon={<AttachMoney />} 
          color="#4caf50"
        />
        <StatCard 
          title="Products Listed" 
          value={products.length} 
          change={`${stats.activeProducts || 0} active`} 
          icon={<Inventory />} 
          color="#2196f3"
        />
        <StatCard 
          title="Orders" 
          value={orders.length} 
          change={`${stats.pendingOrders || 0} pending`} 
          icon={<ShoppingCart />} 
          color="#ff9800"
        />
        <StatCard 
          title="Revenue Growth" 
          value="+15.3%" 
          change="This month" 
          icon={<TrendingUp />} 
          color="#9c27b0"
        />
      </Grid>

      {/* Products Section */}
      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" fontWeight={700}>My Products</Typography>
            <Button 
              variant="contained" 
              startIcon={<Add />}
              onClick={() => setOpenProductDialog(true)}
              sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #2d5016 0%, #3a4d2d 100%)' }}
            >
              Add Product
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar src={product.image} sx={{ mr: 2 }} />
                        {product.name}
                      </Box>
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>${product.price}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>
                      <Chip 
                        label={product.status} 
                        color={product.status === 'active' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Button size="small" startIcon={<Visibility />}>View</Button>
                      <Button size="small" startIcon={<Edit />}>Edit</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} mb={3}>Recent Orders</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell>#{order._id.slice(-6)}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>{order.productName}</TableCell>
                    <TableCell>${order.amount}</TableCell>
                    <TableCell>
                      <Chip 
                        label={order.status} 
                        color={order.status === 'delivered' ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Button size="small" startIcon={<LocalShipping />}>Ship</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SellerDashboard; 
