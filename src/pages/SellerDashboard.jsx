import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import {
  TrendingUp, DollarSign, Package, ShoppingCart, Plus, Eye, Edit3, Trash2,
  User, Settings, BarChart3, Bell, CheckCircle, X, Truck, Star,
  Calendar, Clock, MapPin, Phone, Mail, Camera, Lock, Search,
  Filter, Download, Upload, RefreshCw, AlertCircle, Info,
  ChevronDown, ChevronUp, MoreVertical, Edit, Delete,
  Store, Heart, CalendarDays, FileText, Image
} from 'lucide-react';
import { toast } from 'react-toastify';

const SellerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [openProductDialog, setOpenProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '', category: '', price: '', inStock: '', description: '', image: '', uses: [], quality: 'Standard', grade: 'A',
    // Medicine-specific fields
    dosageForm: '', // tablet, capsule, syrup, powder, oil
    strength: '', // e.g., 500mg, 10ml
    activeIngredients: [], // main ingredients
    indications: [], // what it treats
    dosage: '', // how to take
    contraindications: '', // when not to use
    sideEffects: '', // possible side effects
    expiryDate: '',
    batchNumber: '',
    manufacturer: '',
    licenseNumber: '',
    quantityUnit: 'grams' // grams for herbs, count for medicines
  });
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [priceError, setPriceError] = useState('');
  const [sellerProfile, setSellerProfile] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '', phone: '', profilePic: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  });
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Leave management states
  const [leaves, setLeaves] = useState([]);
  const [openLeaveDialog, setOpenLeaveDialog] = useState(false);
  const [leaveSubmitting, setLeaveSubmitting] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    startDate: '',
    endDate: '',
    reason: '',
    type: 'sick', // sick, personal, vacation, emergency
    description: ''
  });
  
  // Validation states
  const [productErrors, setProductErrors] = useState({});
  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [leaveErrors, setLeaveErrors] = useState({});
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchSellerData();
    
    // Check for tab parameter in URL
    const urlParams = new URLSearchParams(location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [location]);

  const fetchSellerData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [productsRes, ordersRes, statsRes, profileRes, leavesRes] = await Promise.all([
        fetch('http://localhost:5000/api/seller/products', { headers }),
        fetch('http://localhost:5000/api/seller/orders', { headers }),
        fetch('http://localhost:5000/api/seller/stats', { headers }),
        fetch('http://localhost:5000/api/seller/profile', { headers }),
        fetch('http://localhost:5000/api/seller/leaves', { headers })
      ]);

      if (productsRes.ok) setProducts(await productsRes.json());
      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
      if (leavesRes.ok) setLeaves(await leavesRes.json());
      if (profileRes.ok) {
        const profile = await profileRes.json();
        setSellerProfile(profile);
        setProfileForm({
          name: profile.name || '',
          phone: profile.phone || '',
          profilePic: profile.profilePic || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      console.error('Failed to fetch seller data:', error);
      showSnackbar('Failed to fetch data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Validation functions
  const validatePrice = (price) => {
    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue < 50) {
      setPriceError('Price must be at least ₹50');
      return false;
    }
    setPriceError('');
    return true;
  };

  const validateProductForm = () => {
    const errors = {};
    
    // Basic validation
    if (!newProduct.name.trim()) {
      errors.name = 'Product name is required';
    } else if (newProduct.name.trim().length < 3) {
      errors.name = 'Product name must be at least 3 characters';
    }
    
    if (!newProduct.category) {
      errors.category = 'Category is required';
    }
    
    if (!newProduct.price) {
      errors.price = 'Price is required';
    } else {
      const priceValue = parseFloat(newProduct.price);
      if (isNaN(priceValue)) {
        errors.price = 'Price must be a valid number';
      } else if (priceValue <= 0) {
        errors.price = 'Price must be a positive number';
      } else if (priceValue < 50) {
        errors.price = 'Price must be at least ₹50';
      }
    }
    
    if (!newProduct.inStock) {
      errors.inStock = 'Stock is required';
    } else {
      const stockValue = parseFloat(newProduct.inStock);
      if (newProduct.inStock.includes('-')) {
        errors.inStock = newProduct.category === 'Medicines' ? 'Stock quantity cannot be negative' : 'Stock weight cannot be negative';
      } else if (isNaN(stockValue)) {
        errors.inStock = 'Stock must be a valid number';
      } else if (stockValue < 0) {
        errors.inStock = newProduct.category === 'Medicines' ? 'Stock quantity cannot be negative' : 'Stock weight cannot be negative';
      } else if (stockValue === 0) {
        errors.inStock = newProduct.category === 'Medicines' ? 'Stock quantity must be greater than 0' : 'Stock weight must be greater than 0';
      }
    }
    
    if (!newProduct.description.trim()) {
      errors.description = 'Description is required';
    } else if (newProduct.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }
    
    // Image validation - require either uploaded file or URL
    if (!selectedImageFile && !newProduct.image) {
      errors.image = 'Please upload an image or provide an image URL';
    }
    
    // Medicine-specific validation
    if (newProduct.category === 'Medicines') {
      if (!newProduct.dosageForm) {
        errors.dosageForm = 'Dosage form is required';
      }
      
      if (!newProduct.strength.trim()) {
        errors.strength = 'Strength is required';
      }
      
      if (!newProduct.manufacturer.trim()) {
        errors.manufacturer = 'Manufacturer is required';
      }
      
      if (!newProduct.licenseNumber.trim()) {
        errors.licenseNumber = 'License number is required';
      }
      
      if (!newProduct.batchNumber.trim()) {
        errors.batchNumber = 'Batch number is required';
      }
      
      if (!newProduct.expiryDate) {
        errors.expiryDate = 'Expiry date is required';
      } else {
        // Check expiry date is in future
        const expiryDate = new Date(newProduct.expiryDate);
        const today = new Date();
        if (expiryDate <= today) {
          errors.expiryDate = 'Expiry date must be in the future';
        }
      }
      
      if (!newProduct.activeIngredients.length || (Array.isArray(newProduct.activeIngredients) && newProduct.activeIngredients.join('').trim() === '')) {
        errors.activeIngredients = 'At least one active ingredient is required';
      }
      
      if (!newProduct.indications.length || (Array.isArray(newProduct.indications) && newProduct.indications.join('').trim() === '')) {
        errors.indications = 'At least one indication is required';
      }
      
      if (!newProduct.dosage.trim()) {
        errors.dosage = 'Dosage instructions are required';
      }
    }
    
    setProductErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateProfileForm = () => {
    const errors = {};
    
    if (!profileForm.name.trim()) {
      errors.name = 'Name is required';
    } else if (profileForm.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    if (profileForm.phone && !/^\d{10}$/.test(profileForm.phone)) {
      errors.phone = 'Please enter a valid 10-digit phone number';
    }
    
    if (profileForm.profilePic && !/^https?:\/\/.+\..+/.test(profileForm.profilePic)) {
      errors.profilePic = 'Please enter a valid URL';
    }
    
    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePasswordForm = () => {
    const errors = {};
    
    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    if (!passwordForm.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 6) {
      errors.newPassword = 'New password must be at least 6 characters long';
    }
    
    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateLeaveForm = () => {
    const errors = {};
    
    if (!leaveForm.type) {
      errors.type = 'Leave type is required';
    }
    
    if (!leaveForm.reason.trim()) {
      errors.reason = 'Reason is required';
    } else if (leaveForm.reason.trim().length < 3) {
      errors.reason = 'Reason must be at least 3 characters';
    }
    
    if (!leaveForm.startDate) {
      errors.startDate = 'Start date is required';
    }
    
    if (!leaveForm.endDate) {
      errors.endDate = 'End date is required';
    }
    
    if (leaveForm.startDate && leaveForm.endDate) {
      const startDate = new Date(leaveForm.startDate);
      const endDate = new Date(leaveForm.endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (startDate < today) {
        errors.startDate = 'Start date cannot be in the past';
      }

      if (endDate < startDate) {
        errors.endDate = 'End date cannot be before start date';
      }
    }
    
    if (!leaveForm.description.trim()) {
      errors.description = 'Description is required';
    } else if (leaveForm.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }
    
    setLeaveErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle image file selection
  const handleImageFileSelect = (event) => {
    const file = event.target.files[0];
    processImageFile(file);
  };

  // Process image file (used by both file input and drag & drop)
  const processImageFile = (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showSnackbar('Please select an image file', 'error');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showSnackbar('File size must be less than 5MB', 'error');
      return;
    }

    setSelectedImageFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreviewUrl(e.target.result);
      setNewProduct({ ...newProduct, image: e.target.result });
      
      // Clear image error when file is selected
      if (productErrors.image) {
        setProductErrors({ ...productErrors, image: '' });
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      processImageFile(files[0]);
    }
  };

  // Remove selected image file
  const handleRemoveImageFile = () => {
    setSelectedImageFile(null);
    setImagePreviewUrl('');
    setNewProduct({ ...newProduct, image: '' });
  };

  // Convert file to base64 for upload
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleAddProduct = async () => {
    // Validate form
    if (!validateProductForm()) {
      showSnackbar('Please fix the validation errors', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newProduct)
      });

      if (response.ok) {
        const product = await response.json();
        setProducts([product, ...products]);
        setNewProduct({ 
          name: '', category: '', price: '', inStock: '', description: '', image: '', uses: [], quality: 'Standard', grade: 'A',
          dosageForm: '', strength: '', activeIngredients: [], indications: [], dosage: '', contraindications: '', 
          sideEffects: '', expiryDate: '', batchNumber: '', manufacturer: '', licenseNumber: '', quantityUnit: 'grams'
        });
        
        // Clear image upload states
        setSelectedImageFile(null);
        setImagePreviewUrl('');
        
        setOpenProductDialog(false);
        showSnackbar('Product added successfully!');
        
        // Notify other components about the new product
        window.dispatchEvent(new Event('productAdded'));
      } else {
        const error = await response.json();
        showSnackbar(error.error || 'Failed to add product', 'error');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      showSnackbar('Failed to add product', 'error');
    }
  };

  const handleEditProduct = async () => {
    // Validate form
    if (!validateProductForm()) {
      showSnackbar('Please fix the validation errors', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/seller/products/${editingProduct._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newProduct)
      });

      if (response.ok) {
        const updatedProduct = await response.json();
        setProducts(products.map(p => p._id === updatedProduct._id ? updatedProduct : p));
        setEditingProduct(null);
        setNewProduct({ 
          name: '', category: '', price: '', inStock: '', description: '', image: '', uses: [], quality: 'Standard', grade: 'A',
          dosageForm: '', strength: '', activeIngredients: [], indications: [], dosage: '', contraindications: '', 
          sideEffects: '', expiryDate: '', batchNumber: '', manufacturer: '', licenseNumber: '', quantityUnit: 'grams'
        });
        
        // Clear image upload states
        setSelectedImageFile(null);
        setImagePreviewUrl('');
        
        setOpenProductDialog(false);
        showSnackbar('Product updated successfully!');
        
        // Notify other components about the product update
        window.dispatchEvent(new Event('productUpdated'));
      } else {
        const error = await response.json();
        showSnackbar(error.error || 'Failed to update product', 'error');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      showSnackbar('Failed to update product', 'error');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/seller/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setProducts(products.filter(p => p._id !== productId));
        showSnackbar('Product deleted successfully!');
        
        // Notify other components about the product deletion
        window.dispatchEvent(new Event('productDeleted'));
      } else {
        const error = await response.json();
        showSnackbar(error.error || 'Failed to delete product', 'error');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      showSnackbar('Failed to delete product', 'error');
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/seller/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        setOrders(orders.map(order =>
          order._id === orderId ? { ...order, status } : order
        ));
        showSnackbar('Order status updated successfully!');
      } else {
        const error = await response.json();
        showSnackbar(error.error || 'Failed to update order status', 'error');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      showSnackbar('Failed to update order status', 'error');
    }
  };

  const openAddProductDialog = () => {
    resetProductForm();
    setOpenProductDialog(true);
  };

  const openEditDialog = (product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      inStock: product.inStock.toString(),
      description: product.description,
      image: product.image,
      uses: product.uses || [],
      quality: product.quality || 'Standard',
      grade: product.grade || 'A',
      // Medicine-specific fields
      dosageForm: product.dosageForm || '',
      strength: product.strength || '',
      activeIngredients: product.activeIngredients || [],
      indications: product.indications || [],
      dosage: product.dosage || '',
      contraindications: product.contraindications || '',
      sideEffects: product.sideEffects || '',
      expiryDate: product.expiryDate ? product.expiryDate.split('T')[0] : '',
      batchNumber: product.batchNumber || '',
      manufacturer: product.manufacturer || '',
      licenseNumber: product.licenseNumber || '',
      quantityUnit: product.quantityUnit || 'grams'
    });
    
    // Clear file upload states and set image preview if product has image URL
    setSelectedImageFile(null);
    if (product.image && product.image.startsWith('http')) {
      setImagePreviewUrl('');
    } else if (product.image) {
      setImagePreviewUrl(product.image);
    } else {
      setImagePreviewUrl('');
    }
    
    // Clear price error and validate current price
    setPriceError('');
    validatePrice(product.price.toString());
    
    setOpenProductDialog(true);
  };

  const resetProductForm = () => {
    setEditingProduct(null);
    setNewProduct({ 
      name: '', category: '', price: '', inStock: '', description: '', image: '', uses: [], quality: 'Standard', grade: 'A',
      dosageForm: '', strength: '', activeIngredients: [], indications: [], dosage: '', contraindications: '', 
      sideEffects: '', expiryDate: '', batchNumber: '', manufacturer: '', licenseNumber: '', quantityUnit: 'grams'
    });
    
    // Clear image upload states
    setSelectedImageFile(null);
    setImagePreviewUrl('');
    setPriceError('');
    setProductErrors({});
    
    setOpenProductDialog(false);
  };

  const handleUpdateProfile = async () => {
    // Validate form
    if (!validateProfileForm()) {
      showSnackbar('Please fix the validation errors', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/seller/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: profileForm.name,
          phone: profileForm.phone,
          profilePic: profileForm.profilePic
        })
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setSellerProfile(updatedProfile);
        setEditingProfile(false);
        showSnackbar('Profile updated successfully!');
      } else {
        const error = await response.json();
        showSnackbar(error.error || 'Failed to update profile', 'error');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showSnackbar('Failed to update profile', 'error');
    }
  };

  const handleChangePassword = async () => {
    // Validate form
    if (!validatePasswordForm()) {
      showSnackbar('Please fix the validation errors', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/seller/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      if (response.ok) {
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordSection(false);
        showSnackbar('Password changed successfully!');
      } else {
        const error = await response.json();
        showSnackbar(error.error || 'Failed to change password', 'error');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      showSnackbar('Failed to change password', 'error');
    }
  };

  // Leave management functions
  const handleLeaveFormKeyDown = (e) => {
    // Prevent Enter key from submitting form unless it's the submit button
    if (e.key === 'Enter' && e.target.type !== 'submit') {
      e.preventDefault();
    }
  };

  const handleApplyLeave = async () => {
    if (leaveSubmitting) return; // Prevent double submission
    
    // Validate form
    if (!validateLeaveForm()) {
      showSnackbar('Please fix the validation errors', 'error');
      return;
    }
    
    setLeaveSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/seller/leaves', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(leaveForm)
      });
      
      if (response.ok) {
        const data = await response.json();
        const createdLeave = data.leave || data; // support either {leave} or direct leave
        setLeaves([createdLeave, ...leaves]);
        setLeaveForm({
          startDate: '',
          endDate: '',
          reason: '',
          type: 'sick',
          description: ''
        });
        setOpenLeaveDialog(false);
        showSnackbar('Leave application submitted successfully! Admin will review and send email notification.');
      } else if (response.status === 401) {
        console.error('Authentication failed - token may be expired');
        showSnackbar('Session expired. Please login again.', 'error');
        // Don't redirect immediately, let user see the error
        setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }, 2000);
      } else {
        const error = await response.json();
        console.error('Leave application failed:', error);
        console.error('Response details:', {
          status: response.status,
          statusText: response.statusText,
          error: error
        });
        showSnackbar(error.error || 'Failed to apply for leave', 'error');
      }
    } catch (error) {
      console.error('Error applying for leave:', error);
      showSnackbar('Failed to apply for leave', 'error');
    } finally {
      setLeaveSubmitting(false);
    }
  };

  const resetLeaveForm = () => {
    setLeaveForm({
      startDate: '',
      endDate: '',
      reason: '',
      type: 'sick',
      description: ''
    });
    setLeaveSubmitting(false);
    setOpenLeaveDialog(false);
    setLeaveErrors({});
  };

  const getLeaveStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-gray-200 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLeaveTypeColor = (type) => {
    switch (type) {
      case 'sick': return 'bg-red-100 text-red-800';
      case 'personal': return 'bg-blue-100 text-blue-800';
      case 'vacation': return 'bg-green-100 text-green-800';
      case 'emergency': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateLeaveDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  };

  // Cancel a pending leave (DELETE /leaves/:id)
  const handleCancelPendingLeave = async (leaveId) => {
    if (!leaveId) return;
    if (!window.confirm('Cancel this pending leave request?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/seller/leaves/${leaveId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const updated = data.leave || null;
        if (updated) {
          setLeaves(prev => prev.map(l => l._id === updated._id ? updated : l));
        } else {
          setLeaves(prev => prev.map(l => l._id === leaveId ? { ...l, status: 'cancelled' } : l));
        }
        showSnackbar('Leave cancelled successfully');
      } else {
        const err = await res.json();
        showSnackbar(err.error || 'Failed to cancel leave', 'error');
      }
    } catch (e) {
      console.error('Cancel pending leave error:', e);
      showSnackbar('Failed to cancel leave', 'error');
    }
  };

  // Cancel an approved leave before it starts (PUT /leaves/:id/cancel)
  const handleCancelApprovedLeave = async (leaveId) => {
    if (!leaveId) return;
    if (!window.confirm('Cancel this approved leave? This is only allowed before the start date.')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/seller/leaves/${leaveId}/cancel`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const updated = data.leave || null;
        if (updated) {
          setLeaves(prev => prev.map(l => l._id === updated._id ? updated : l));
        }
        showSnackbar('Leave cancelled successfully');
      } else {
        const err = await res.json();
        showSnackbar(err.error || 'Failed to cancel approved leave', 'error');
      }
    } catch (e) {
      console.error('Cancel approved leave error:', e);
      showSnackbar('Failed to cancel approved leave', 'error');
    }
  };

  // Filter and sort products
  const filteredProducts = products
    .filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterCategory === '' || product.category === filterCategory)
    )
    .sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { text: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (stock <= 5) return { text: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
    return { text: 'In Stock', color: 'bg-green-100 text-green-800' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {sellerProfile?.name || 'Seller'}!
              </h1>
              <p className="text-gray-600">Manage your products and track your business performance</p>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <div className="relative">
                <Bell className="w-6 h-6 text-gray-600" />
                {stats.pendingOrders > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {stats.pendingOrders}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <img
                  src={sellerProfile?.profilePic || `https://ui-avatars.com/api/?name=${sellerProfile?.name}&background=10b981&color=fff`}
                  alt="Profile"
                  className="w-10 h-10 rounded-full"
                />
                <span className="text-sm font-medium text-gray-700">{sellerProfile?.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold">₹{(Number(stats.totalSales) || 0).toLocaleString('en-IN')}</p>
                <p className="text-emerald-100 text-sm">from all sales</p>
              </div>
              <DollarSign className="w-12 h-12 text-emerald-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Products Listed</p>
                <p className="text-3xl font-bold">{stats.totalProducts || products.length}</p>
                <p className="text-blue-100 text-sm">{stats.activeProducts || 0} in stock</p>
              </div>
              <Package className="w-12 h-12 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Total Orders</p>
                <p className="text-3xl font-bold">{stats.totalOrders || orders.length}</p>
                <p className="text-yellow-100 text-sm">{stats.pendingOrders || 0} pending</p>
              </div>
              <ShoppingCart className="w-12 h-12 text-yellow-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Active Products</p>
                <p className="text-3xl font-bold">{stats.activeProducts || 0}</p>
                <p className="text-purple-100 text-sm">{stats.outOfStockProducts || 0} out of stock</p>
              </div>
              <Store className="w-12 h-12 text-purple-200" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'products', label: 'Products', icon: Package },
                { id: 'orders', label: 'Orders', icon: ShoppingCart },
                { id: 'analytics', label: 'Analytics', icon: TrendingUp },
                { id: 'leaves', label: 'Leave Management', icon: CalendarDays },
                { id: 'profile', label: 'Profile', icon: User }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-emerald-500 text-emerald-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={openAddProductDialog}
                  className="flex items-center space-x-3 p-4 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
                >
                  <Plus className="w-6 h-6 text-emerald-600" />
                  <span className="font-medium text-emerald-700">Add New Product</span>
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                >
                  <ShoppingCart className="w-6 h-6 text-blue-600" />
                  <span className="font-medium text-blue-700">View Orders</span>
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className="flex items-center space-x-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors"
                >
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                  <span className="font-medium text-purple-700">View Analytics</span>
                </button>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {orders.slice(0, 5).map((order, index) => (
                  <div key={order._id || `order-${index}`} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                        <ShoppingCart className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">#{order._id ? order._id.slice(-6) : 'N/A'}</p>
                        <p className="text-sm text-gray-600">{order.user?.name || 'Unknown Customer'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">₹{(Number(order.totalAmount || order.amount) || 0).toLocaleString('en-IN')}</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
                {orders.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No orders yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="bg-white rounded-2xl shadow-lg">
            {/* Products Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                <h2 className="text-xl font-bold text-gray-900">My Products ({filteredProducts.length})</h2>
                <button
                  onClick={openAddProductDialog}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Product</span>
                </button>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 w-full"
                  />
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">All Categories</option>
                  <option value="Herbs">Herbs</option>
                  <option value="Spices">Spices</option>
                  <option value="Medicinal">Medicinal</option>
                  <option value="Organic">Organic</option>
                  <option value="Essential Oils">Essential Oils</option>
                </select>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field);
                    setSortOrder(order);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="name-asc">Name A-Z</option>
                  <option value="name-desc">Name Z-A</option>
                  <option value="price-asc">Price Low-High</option>
                  <option value="price-desc">Price High-Low</option>
                  <option value="inStock-desc">Weight High-Low</option>
                </select>
              </div>
            </div>

            {/* Products Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quality</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                        No products found
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product, index) => {
                      const stockStatus = getStockStatus(product.inStock || product.stock || 0);
                      return (
                        <tr key={product._id || `product-${index}`} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img
                                src={product.image || '/api/placeholder/40/40'}
                                alt={product.name}
                                className="w-10 h-10 rounded-lg object-cover mr-3"
                              />
                              <div>
                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                <div className="text-sm text-gray-500">{product.description?.substring(0, 50)}...</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                              {product.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                              {product.quality || 'Standard'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 rounded-full">
                              {product.grade || 'A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            ₹{product.price}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {(() => {
                              const stock = product.inStock || product.stock || 0;
                              if (product.category === 'Medicines') {
                                return `${stock} ${product.dosageForm || 'units'}`;
                              }
                              return stock < 1000 ? `${stock}g` : `${(stock/1000).toFixed(1)}kg`;
                            })()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${stockStatus.color}`}>
                              {stockStatus.text}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => openEditDialog(product)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product._id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl shadow-lg">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Orders Management ({orders.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        No orders found yet
                      </td>
                    </tr>
                  ) : (
                    orders.map((order, index) => (
                      <tr key={order._id || `order-detail-${index}`} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{order._id ? order._id.slice(-6) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {order.user?.name || order.customerName || 'Unknown'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.user?.email || 'No email'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {order.items?.map((item, index) => (
                              <div key={`${order._id}-item-${index}`} className="text-sm text-gray-900">
                                {item.product?.name || item.productName} (x{item.quantity})
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ₹{(Number(order.totalAmount || order.amount) || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            {order.status === 'pending' && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order._id, 'confirmed')}
                                className="text-green-600 hover:text-green-900"
                                title="Confirm Order"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            {order.status === 'confirmed' && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order._id, 'shipped')}
                                className="text-blue-600 hover:text-blue-900"
                                title="Mark as Shipped"
                              >
                                <Truck className="w-4 h-4" />
                              </button>
                            )}
                            {order.status === 'shipped' && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order._id, 'delivered')}
                                className="text-green-600 hover:text-green-900"
                                title="Mark as Delivered"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            {['pending', 'confirmed'].includes(order.status) && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order._id, 'cancelled')}
                                className="text-red-600 hover:text-red-900"
                                title="Cancel Order"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Analytics & Insights</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-emerald-800">Sales Performance</h3>
                    <TrendingUp className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="text-3xl font-bold text-emerald-700 mb-2">
                    ₹{(Number(stats.totalSales) || 0).toLocaleString('en-IN')}
                  </div>
                  <p className="text-emerald-600">Total revenue from {stats.totalOrders || 0} orders</p>
                  <div className="mt-4 bg-emerald-200 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-blue-800">Product Performance</h3>
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-blue-700 mb-2">
                    {stats.activeProducts || 0}
                  </div>
                  <p className="text-blue-600">Active products out of {stats.totalProducts || 0} total</p>
                  <div className="mt-4 bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${((stats.activeProducts || 0) / (stats.totalProducts || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Seller Profile</h2>
              <button
                onClick={() => setEditingProfile(!editingProfile)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>{editingProfile ? 'Cancel' : 'Edit Profile'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <img
                  src={sellerProfile?.profilePic || `https://ui-avatars.com/api/?name=${sellerProfile?.name}&background=10b981&color=fff&size=120`}
                  alt="Profile"
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-lg font-semibold text-gray-900">{sellerProfile?.name || 'Seller Name'}</h3>
                <p className="text-gray-600">{sellerProfile?.email || 'seller@example.com'}</p>
                <p className="text-sm text-emerald-600 font-medium mt-2 capitalize">
                  {sellerProfile?.role || 'Seller'}
                </p>
              </div>

              <div className="md:col-span-2">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    {editingProfile ? (
                      <div>
                        <input
                          type="text"
                          value={profileForm.name}
                          onChange={(e) => {
                            setProfileForm({ ...profileForm, name: e.target.value });
                            if (profileErrors.name && e.target.value.trim().length >= 2) {
                              setProfileErrors({ ...profileErrors, name: '' });
                            }
                          }}
                          className={`w-full px-3 py-2 border ${profileErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                        />
                        {profileErrors.name && (
                          <p className="mt-1 text-sm text-red-600">{profileErrors.name}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-900">{sellerProfile?.name || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-gray-900">{sellerProfile?.email || 'Not provided'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    {editingProfile ? (
                      <div>
                        <input
                          type="text"
                          value={profileForm.phone}
                          onChange={(e) => {
                            setProfileForm({ ...profileForm, phone: e.target.value });
                            if (profileErrors.phone && /^\d{10}$/.test(e.target.value)) {
                              setProfileErrors({ ...profileErrors, phone: '' });
                            }
                          }}
                          className={`w-full px-3 py-2 border ${profileErrors.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                        />
                        {profileErrors.phone && (
                          <p className="mt-1 text-sm text-red-600">{profileErrors.phone}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-900">{sellerProfile?.phone || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture URL</label>
                    {editingProfile ? (
                      <div>
                        <input
                          type="url"
                          value={profileForm.profilePic}
                          onChange={(e) => {
                            setProfileForm({ ...profileForm, profilePic: e.target.value });
                            if (profileErrors.profilePic && /^https?:\/\/.+\..+/.test(e.target.value)) {
                              setProfileErrors({ ...profileErrors, profilePic: '' });
                            }
                          }}
                          className={`w-full px-3 py-2 border ${profileErrors.profilePic ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                        />
                        {profileErrors.profilePic && (
                          <p className="mt-1 text-sm text-red-600">{profileErrors.profilePic}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-900">{sellerProfile?.profilePic || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <p className="text-gray-900 capitalize">{sellerProfile?.role || 'seller'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <p className="text-gray-900">{sellerProfile?.department || 'General'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Status</label>
                    <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                      sellerProfile?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {sellerProfile?.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
                    <p className="text-gray-900">
                      {sellerProfile?.createdAt ? new Date(sellerProfile.createdAt).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>

                  {/* Seller Statistics */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 mt-4">
                    <div className="text-center p-3 bg-emerald-50 rounded-lg">
                      <div className="text-2xl font-bold text-emerald-600">{products.length}</div>
                      <div className="text-sm text-gray-600">Products Listed</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{orders.length}</div>
                      <div className="text-sm text-gray-600">Total Orders</div>
                    </div>
                  </div>

                  {/* Password Change Section */}
                  <div className="border-t border-gray-200 pt-6 mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Lock className="w-5 h-5 mr-2 text-emerald-600" />
                        Change Password
                      </h4>
                      <button
                        onClick={() => setShowPasswordSection(!showPasswordSection)}
                        className="text-emerald-600 hover:text-emerald-700 font-medium text-sm transition-colors"
                      >
                        {showPasswordSection ? 'Cancel' : 'Change Password'}
                      </button>
                    </div>

                    {showPasswordSection && (
                      <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                          <div>
                            <input
                              type="password"
                              value={passwordForm.currentPassword}
                              onChange={(e) => {
                                setPasswordForm({ ...passwordForm, currentPassword: e.target.value });
                                if (passwordErrors.currentPassword) {
                                  setPasswordErrors({ ...passwordErrors, currentPassword: '' });
                                }
                              }}
                              className={`w-full px-3 py-2 border ${passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                              placeholder="Enter current password"
                            />
                            {passwordErrors.currentPassword && (
                              <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword}</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                          <div>
                            <input
                              type="password"
                              value={passwordForm.newPassword}
                              onChange={(e) => {
                                setPasswordForm({ ...passwordForm, newPassword: e.target.value });
                                if (passwordErrors.newPassword && e.target.value.length >= 6) {
                                  setPasswordErrors({ ...passwordErrors, newPassword: '' });
                                }
                              }}
                              className={`w-full px-3 py-2 border ${passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                              placeholder="Enter new password (min 6 characters)"
                            />
                            {passwordErrors.newPassword && (
                              <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword}</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                          <div>
                            <input
                              type="password"
                              value={passwordForm.confirmPassword}
                              onChange={(e) => {
                                setPasswordForm({ ...passwordForm, confirmPassword: e.target.value });
                                if (passwordErrors.confirmPassword && passwordForm.newPassword === e.target.value) {
                                  setPasswordErrors({ ...passwordErrors, confirmPassword: '' });
                                }
                              }}
                              className={`w-full px-3 py-2 border ${passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                              placeholder="Confirm new password"
                            />
                            {passwordErrors.confirmPassword && (
                              <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex space-x-3 pt-2">
                          <button
                            onClick={handleChangePassword}
                            disabled={!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                          >
                            <Lock className="w-4 h-4" />
                            <span>Change Password</span>
                          </button>
                          <button
                            onClick={() => {
                              setShowPasswordSection(false);
                              setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                              setPasswordErrors({});
                            }}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {editingProfile && (
                    <div className="flex space-x-4 pt-4">
                      <button
                        onClick={handleUpdateProfile}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg transition-colors"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => {
                          setEditingProfile(false);
                          setProfileErrors({});
                        }}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leave Management Tab */}
        {activeTab === 'leaves' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <CalendarDays className="w-6 h-6 mr-2 text-emerald-600" />
                Leave Management
              </h2>
              <button
                onClick={() => setOpenLeaveDialog(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Apply for Leave</span>
              </button>
            </div>

            {/* Leave Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">Total Applied</p>
                    <p className="text-2xl font-bold text-blue-700">{leaves.length}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">Approved</p>
                    <p className="text-2xl font-bold text-green-700">
                      {leaves.filter(leave => leave.status === 'approved').length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-600 text-sm font-medium">Pending</p>
                    <p className="text-2xl font-bold text-yellow-700">
                      {leaves.filter(leave => leave.status === 'pending').length}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </div>
              <div className="bg-red-50 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-600 text-sm font-medium">Rejected</p>
                    <p className="text-2xl font-bold text-red-700">
                      {leaves.filter(leave => leave.status === 'rejected').length}
                    </p>
                  </div>
                  <X className="w-8 h-8 text-red-500" />
                </div>
              </div>
            </div>

            {/* Leave Applications List */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied On</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaves.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-lg font-medium">No leave applications yet</p>
                        <p className="text-sm">Click "Apply for Leave" to submit your first application</p>
                      </td>
                    </tr>
                  ) : (
                    leaves.map((leave, index) => (
                      <tr key={leave._id || `leave-${index}`} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getLeaveTypeColor(leave.type || 'sick')}`}>
                            {leave.type ? leave.type.charAt(0).toUpperCase() + leave.type.slice(1) : 'Sick'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            <div className="font-medium">
                              {leave.startDate && leave.endDate ? 
                                `${new Date(leave.startDate).toLocaleDateString()} - ${new Date(leave.endDate).toLocaleDateString()}` : 
                                'Date not available'
                              }
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {leave.startDate && leave.endDate ? calculateLeaveDays(leave.startDate, leave.endDate) : 0} days
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="max-w-xs">
                            <div className="font-medium">{leave.reason || 'No reason provided'}</div>
                            {leave.description && (
                              <div className="text-gray-500 text-xs mt-1 truncate">{leave.description}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getLeaveStatusColor(leave.status || 'pending')}`}>
                              {leave.status ? leave.status.charAt(0).toUpperCase() + leave.status.slice(1) : 'Pending'}
                            </span>
                            {/* Cancel actions */}
                            {leave.status === 'pending' && (
                              <button
                                onClick={() => handleCancelPendingLeave(leave._id)}
                                className="inline-flex items-center gap-1 text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-1 rounded-full text-xs font-medium transition-colors"
                                title="Cancel this pending leave"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                                  <path fillRule="evenodd" d="M12 2.25a9.75 9.75 0 1 0 0 19.5 9.75 9.75 0 0 0 0-19.5ZM8.47 8.47a.75.75 0 0 1 1.06 0L12 10.94l2.47-2.47a.75.75 0 1 1 1.06 1.06L13.06 12l2.47 2.47a.75.75 0 1 1-1.06 1.06L12 13.06l-2.47 2.47a.75.75 0 0 1-1.06-1.06L10.94 12 8.47 9.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                                </svg>
                                Cancel
                              </button>
                            )}
                            {leave.status === 'approved' && new Date() < new Date(leave.startDate) && (
                              <button
                                onClick={() => handleCancelApprovedLeave(leave._id)}
                                className="inline-flex items-center gap-1 text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-1 rounded-full text-xs font-medium transition-colors"
                                title="Cancel this approved leave (before start date)"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                                  <path fillRule="evenodd" d="M12 2.25a9.75 9.75 0 1 0 0 19.5 9.75 9.75 0 0 0 0-19.5ZM8.47 8.47a.75.75 0 0 1 1.06 0L12 10.94l2.47-2.47a.75.75 0 1 1 1.06 1.06L13.06 12l2.47 2.47a.75.75 0 1 1-1.06 1.06L12 13.06l-2.47 2.47a.75.75 0 0 1-1.06-1.06L10.94 12 8.47 9.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                                </svg>
                                Cancel
                              </button>
                            )}
                          </div>
                          {leave.adminComment && (
                            <div className="text-xs text-gray-500 mt-1">
                              Admin: {leave.adminComment}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {leave.createdAt ? new Date(leave.createdAt).toLocaleDateString() : 'Unknown'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Product Dialog */}
      {openProductDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-emerald-600 text-white p-6 rounded-t-2xl">
              <h3 className="text-xl font-bold">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Geographical Indication (GI)</label>
                  <input
                    type="text"
                    value={newProduct.geoIndication || ''}
                    onChange={(e) => setNewProduct({ ...newProduct, geoIndication: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="e.g., Malabar Pepper, Darjeeling Tea"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <div>
                    <input
                      type="text"
                      value={newProduct.name}
                      onChange={(e) => {
                        setNewProduct({ ...newProduct, name: e.target.value });
                        if (productErrors.name && e.target.value.trim().length >= 3) {
                          setProductErrors({ ...productErrors, name: '' });
                        }
                      }}
                      className={`w-full px-3 py-2 border ${productErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                      placeholder="Enter product name"
                      required
                    />
                    {productErrors.name && (
                      <p className="mt-1 text-sm text-red-600">{productErrors.name}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => {
                      setNewProduct({ 
                        ...newProduct, 
                        category: e.target.value,
                        quantityUnit: e.target.value === 'Medicines' ? 'count' : 'grams'
                      });
                      if (productErrors.category) {
                        setProductErrors({ ...productErrors, category: '' });
                      }
                    }}
                    className={`w-full px-3 py-2 border ${productErrors.category ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                  >
                    <option value="">Select Category</option>
                    <option value="Herbs">Herbs</option>
                    <option value="Spices">Spices</option>
                    <option value="Roots">Roots</option>
                    <option value="Leaves">Leaves</option>
                    <option value="Medicinal">Medicinal</option>
                    <option value="Medicines">Ayurvedic Medicines</option>
                    <option value="Essential Oils">Essential Oils</option>
                    <option value="Organic">Organic</option>
                  </select>
                  {productErrors.category && (
                    <p className="mt-1 text-sm text-red-600">{productErrors.category}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <div>
                    <input
                      type="number"
                      step="0.01"
                      value={newProduct.price}
                      onChange={(e) => {
                        setNewProduct({ ...newProduct, price: e.target.value });
                        validatePrice(e.target.value);
                        if (productErrors.price && parseFloat(e.target.value) >= 50) {
                          setProductErrors({ ...productErrors, price: '' });
                        }
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                        priceError || productErrors.price ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="50.00"
                    />
                    {(priceError || productErrors.price) && (
                      <p className="mt-1 text-sm text-red-600">{priceError || productErrors.price}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {newProduct.category === 'Medicines' ? 'Stock Quantity (count)' : 'Stock Weight (grams)'} <span className="text-red-500">*</span>
                  </label>
                  <div>
                    <input
                      type="number"
                      value={newProduct.inStock}
                      onChange={(e) => {
                        setNewProduct({ ...newProduct, inStock: e.target.value });
                        
                        // Real-time validation as user types
                        if (!e.target.value || e.target.value.trim() === "") {
                          setProductErrors({ ...productErrors, inStock: 'Stock is required' });
                        } else if (e.target.value.includes('-')) {
                          setProductErrors({ ...productErrors, inStock: 'Stock cannot be negative' });
                        } else {
                          const stockValue = parseFloat(e.target.value);
                          if (isNaN(stockValue)) {
                            setProductErrors({ ...productErrors, inStock: 'Stock must be a valid number' });
                          } else if (stockValue < 0) {
                            setProductErrors({ ...productErrors, inStock: newProduct.category === 'Medicines' ? 'Stock quantity cannot be negative' : 'Stock weight cannot be negative' });
                          } else if (stockValue === 0) {
                            setProductErrors({ ...productErrors, inStock: newProduct.category === 'Medicines' ? 'Stock quantity must be greater than 0' : 'Stock weight must be greater than 0' });
                          } else {
                            setProductErrors({ ...productErrors, inStock: '' });
                          }
                        }
                      }}
                      min="0" step="1"
                      className={`w-full px-3 py-2 border ${productErrors.inStock ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                      placeholder={newProduct.category === 'Medicines' ? 'Enter quantity (e.g., 100 tablets)' : 'Enter weight in grams (e.g., 500)'}
                    />
                    {productErrors.inStock && (
                      <p className="mt-1 text-sm text-red-600">{productErrors.inStock}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      {newProduct.category === 'Medicines' 
                        ? 'Enter number of units (tablets, capsules, bottles, etc.)'
                        : 'Enter weight in grams (1000g = 1kg)'
                      }
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quality</label>
                  <select
                    value={newProduct.quality}
                    onChange={(e) => setNewProduct({ ...newProduct, quality: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Premium">Premium</option>
                    <option value="Organic">Organic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                  <select
                    value={newProduct.grade}
                    onChange={(e) => setNewProduct({ ...newProduct, grade: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="A">Grade A</option>
                    <option value="A+">Grade A+</option>
                    <option value="Premium">Premium Grade</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Image <span className="text-red-500">*</span>
                  </label>
                  
                  {/* File Upload Area */}
                  <div 
                    className={`border-2 border-dashed rounded-lg p-6 text-center hover:border-emerald-500 transition-colors ${
                      productErrors.image ? 'border-red-500' : 'border-gray-300'
                    }`}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    {!imagePreviewUrl ? (
                      <div>
                        <Image className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">
                            <label htmlFor="image-upload" className="cursor-pointer text-emerald-600 hover:text-emerald-500 font-medium">
                              Click to upload
                            </label>
                            {' '}or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                        </div>
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileSelect}
                          className="hidden"
                        />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="relative inline-block">
                          <img
                            src={imagePreviewUrl}
                            alt="Product preview"
                            className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveImageFile}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-2">
                            {selectedImageFile?.name}
                          </p>
                          <label htmlFor="image-upload-replace" className="cursor-pointer text-emerald-600 hover:text-emerald-500 font-medium text-sm">
                            Replace image
                          </label>
                          <input
                            id="image-upload-replace"
                            type="file"
                            accept="image/*"
                            onChange={handleImageFileSelect}
                            className="hidden"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  {productErrors.image && (
                    <p className="mt-1 text-sm text-red-600">{productErrors.image}</p>
                  )}
                  
                  {/* Alternative: Image URL input (optional) */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Or enter image URL
                      </label>
                      <span className="text-xs text-gray-500">Optional</span>
                    </div>
                    <input
                      type="url"
                      value={!selectedImageFile ? newProduct.image : ''}
                      onChange={(e) => {
                        if (!selectedImageFile) {
                          setNewProduct({ ...newProduct, image: e.target.value });
                          if (productErrors.image) {
                            setProductErrors({ ...productErrors, image: '' });
                          }
                        }
                      }}
                      disabled={!!selectedImageFile}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                        selectedImageFile ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                      placeholder="https://example.com/image.jpg"
                    />
                    {newProduct.image && !selectedImageFile && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 mb-1">URL Preview:</p>
                        <img
                          src={newProduct.image}
                          alt="Product preview"
                          className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <div>
                  <textarea
                    rows={3}
                    value={newProduct.description}
                    onChange={(e) => {
                      setNewProduct({ ...newProduct, description: e.target.value });
                      if (productErrors.description && e.target.value.trim().length >= 10) {
                        setProductErrors({ ...productErrors, description: '' });
                      }
                    }}
                    className={`w-full px-3 py-2 border ${productErrors.description ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                    placeholder="Enter product description"
                  />
                  {productErrors.description && (
                    <p className="mt-1 text-sm text-red-600">{productErrors.description}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Uses (comma separated)</label>
                <textarea
                  rows={2}
                  value={Array.isArray(newProduct.uses) ? newProduct.uses.join(', ') : (newProduct.uses || '')}
                  onChange={(e) => {
                    const raw = e.target.value;
                    // Allow spaces and commas as typed; only split to array when saving
                    setNewProduct({ ...newProduct, uses: raw });
                  }}
                  onBlur={(e) => {
                    const arr = String(e.target.value)
                      .split(',')
                      .map(s => s.trim())
                      .filter(Boolean);
                    setNewProduct(prev => ({ ...prev, uses: arr }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Digestive, Anti-inflammatory, Antioxidant"
                />
                <p className="text-sm text-gray-500 mt-1">Enter uses separated by commas</p>
              </div>

              {/* Medicine-specific fields */}
              {newProduct.category === 'Medicines' && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 space-y-4">
                  <h4 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Ayurvedic Medicine Details
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dosage Form <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={newProduct.dosageForm}
                        onChange={(e) => {
                          setNewProduct({ ...newProduct, dosageForm: e.target.value });
                          if (productErrors.dosageForm) {
                            setProductErrors({ ...productErrors, dosageForm: '' });
                          }
                        }}
                        className={`w-full px-3 py-2 border ${productErrors.dosageForm ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                        required
                      >
                        <option value="">Select Dosage Form</option>
                        <option value="tablet">Tablet</option>
                        <option value="capsule">Capsule</option>
                        <option value="syrup">Syrup</option>
                        <option value="powder">Powder</option>
                        <option value="oil">Oil</option>
                        <option value="churna">Churna</option>
                        <option value="vati">Vati</option>
                        <option value="kashayam">Kashayam</option>
                        <option value="ghrita">Ghrita</option>
                        <option value="asava">Asava/Arishta</option>
                      </select>
                      {productErrors.dosageForm && (
                        <p className="mt-1 text-sm text-red-600">{productErrors.dosageForm}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Strength <span className="text-red-500">*</span>
                      </label>
                      <div>
                        <input
                          type="text"
                          value={newProduct.strength}
                          onChange={(e) => {
                            setNewProduct({ ...newProduct, strength: e.target.value });
                            if (productErrors.strength) {
                              setProductErrors({ ...productErrors, strength: '' });
                            }
                          }}
                          className={`w-full px-3 py-2 border ${productErrors.strength ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                          placeholder="e.g., 500mg, 10ml, 250mg per tablet"
                          required
                        />
                        {productErrors.strength && (
                          <p className="mt-1 text-sm text-red-600">{productErrors.strength}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Manufacturer <span className="text-red-500">*</span>
                      </label>
                      <div>
                        <input
                          type="text"
                          value={newProduct.manufacturer}
                          onChange={(e) => {
                            setNewProduct({ ...newProduct, manufacturer: e.target.value });
                            if (productErrors.manufacturer) {
                              setProductErrors({ ...productErrors, manufacturer: '' });
                            }
                          }}
                          className={`w-full px-3 py-2 border ${productErrors.manufacturer ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                          placeholder="Manufacturer name"
                          required
                        />
                        {productErrors.manufacturer && (
                          <p className="mt-1 text-sm text-red-600">{productErrors.manufacturer}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        License Number <span className="text-red-500">*</span>
                      </label>
                      <div>
                        <input
                          type="text"
                          value={newProduct.licenseNumber}
                          onChange={(e) => {
                            setNewProduct({ ...newProduct, licenseNumber: e.target.value });
                            if (productErrors.licenseNumber) {
                              setProductErrors({ ...productErrors, licenseNumber: '' });
                            }
                          }}
                          className={`w-full px-3 py-2 border ${productErrors.licenseNumber ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                          placeholder="Manufacturing license number"
                          required
                        />
                        {productErrors.licenseNumber && (
                          <p className="mt-1 text-sm text-red-600">{productErrors.licenseNumber}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Batch Number <span className="text-red-500">*</span>
                      </label>
                      <div>
                        <input
                          type="text"
                          value={newProduct.batchNumber}
                          onChange={(e) => {
                            setNewProduct({ ...newProduct, batchNumber: e.target.value });
                            if (productErrors.batchNumber) {
                              setProductErrors({ ...productErrors, batchNumber: '' });
                            }
                          }}
                          className={`w-full px-3 py-2 border ${productErrors.batchNumber ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                          placeholder="Batch number"
                          required
                        />
                        {productErrors.batchNumber && (
                          <p className="mt-1 text-sm text-red-600">{productErrors.batchNumber}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date <span className="text-red-500">*</span>
                      </label>
                      <div>
                        <input
                          type="date"
                          value={newProduct.expiryDate}
                          onChange={(e) => {
                            setNewProduct({ ...newProduct, expiryDate: e.target.value });
                            if (productErrors.expiryDate) {
                              const expiryDate = new Date(e.target.value);
                              const today = new Date();
                              if (expiryDate > today) {
                                setProductErrors({ ...productErrors, expiryDate: '' });
                              }
                            }
                          }}
                          className={`w-full px-3 py-2 border ${productErrors.expiryDate ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                          min={new Date().toISOString().split('T')[0]}
                          required
                        />
                        {productErrors.expiryDate && (
                          <p className="mt-1 text-sm text-red-600">{productErrors.expiryDate}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Active Ingredients <span className="text-red-500">*</span>
                    </label>
                    <div>
                      <input
                        type="text"
                        value={Array.isArray(newProduct.activeIngredients) ? newProduct.activeIngredients.join(', ') : newProduct.activeIngredients}
                        onChange={(e) => {
                          setNewProduct({
                            ...newProduct,
                            activeIngredients: e.target.value.split(',').map(ingredient => ingredient.trim()).filter(ingredient => ingredient)
                          });
                          if (productErrors.activeIngredients && e.target.value.trim()) {
                            setProductErrors({ ...productErrors, activeIngredients: '' });
                          }
                        }}
                        className={`w-full px-3 py-2 border ${productErrors.activeIngredients ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                        placeholder="Ashwagandha, Brahmi, Shankhpushpi"
                        required
                      />
                      {productErrors.activeIngredients && (
                        <p className="mt-1 text-sm text-red-600">{productErrors.activeIngredients}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-1">Enter main ingredients separated by commas</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Indications <span className="text-red-500">*</span>
                    </label>
                    <div>
                      <input
                        type="text"
                        value={Array.isArray(newProduct.indications) ? newProduct.indications.join(', ') : newProduct.indications}
                        onChange={(e) => {
                          setNewProduct({
                            ...newProduct,
                            indications: e.target.value.split(',').map(indication => indication.trim()).filter(indication => indication)
                          });
                          if (productErrors.indications && e.target.value.trim()) {
                            setProductErrors({ ...productErrors, indications: '' });
                          }
                        }}
                        className={`w-full px-3 py-2 border ${productErrors.indications ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                        placeholder="Stress relief, Memory enhancement, Anxiety"
                        required
                      />
                      {productErrors.indications && (
                        <p className="mt-1 text-sm text-red-600">{productErrors.indications}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-1">What conditions this medicine treats</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dosage Instructions <span className="text-red-500">*</span>
                    </label>
                    <div>
                      <textarea
                        rows={2}
                        value={newProduct.dosage}
                        onChange={(e) => {
                          setNewProduct({ ...newProduct, dosage: e.target.value });
                          if (productErrors.dosage && e.target.value.trim()) {
                            setProductErrors({ ...productErrors, dosage: '' });
                          }
                        }}
                        className={`w-full px-3 py-2 border ${productErrors.dosage ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                        placeholder="1-2 tablets twice daily after meals or as directed by physician"
                        required
                      />
                      {productErrors.dosage && (
                        <p className="mt-1 text-sm text-red-600">{productErrors.dosage}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contraindications</label>
                    <textarea
                      rows={2}
                      value={newProduct.contraindications}
                      onChange={(e) => setNewProduct({ ...newProduct, contraindications: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Not recommended during pregnancy, avoid with certain medications..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Side Effects</label>
                    <textarea
                      rows={2}
                      value={newProduct.sideEffects}
                      onChange={(e) => setNewProduct({ ...newProduct, sideEffects: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Mild stomach upset, drowsiness (rare)..."
                    />
                  </div>
                </div>
              )}
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Product Guidelines:</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-700">
                      <li>Fields marked with <span className="text-red-500">*</span> are required</li>
                      <li>Enter stock weight in grams (e.g., 500g = 0.5kg)</li>
                      <li>Price should be per gram (customers buy by weight) - minimum ₹50</li>
                      <li>Use high-quality images for better product visibility</li>
                      <li>Provide detailed descriptions to help customers understand your product</li>
                      <li>List specific uses to help customers find your product through search</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 p-6 bg-gray-50 rounded-b-2xl">
              <button
                onClick={resetProductForm}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingProduct ? handleEditProduct : handleAddProduct}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
              >
                {editingProduct ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Application Dialog */}
      {openLeaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-emerald-600 text-white p-6 rounded-t-2xl">
              <h3 className="text-xl font-bold flex items-center">
                <CalendarDays className="w-6 h-6 mr-2" />
                Apply for Leave
              </h3>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleApplyLeave(); }} onKeyDown={handleLeaveFormKeyDown} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Leave Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={leaveForm.type}
                    onChange={(e) => {
                      setLeaveForm({ ...leaveForm, type: e.target.value });
                      if (leaveErrors.type) {
                        setLeaveErrors({ ...leaveErrors, type: '' });
                      }
                    }}
                    className={`w-full px-3 py-2 border ${leaveErrors.type ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                    required
                  >
                    <option value="sick">Sick Leave</option>
                    <option value="personal">Personal Leave</option>
                    <option value="vacation">Vacation</option>
                    <option value="emergency">Emergency Leave</option>
                  </select>
                  {leaveErrors.type && (
                    <p className="mt-1 text-sm text-red-600">{leaveErrors.type}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason <span className="text-red-500">*</span>
                  </label>
                  <div>
                    <input
                      type="text"
                      value={leaveForm.reason}
                      onChange={(e) => {
                        setLeaveForm({ ...leaveForm, reason: e.target.value });
                        if (leaveErrors.reason && e.target.value.trim().length >= 3) {
                          setLeaveErrors({ ...leaveErrors, reason: '' });
                        }
                      }}
                      className={`w-full px-3 py-2 border ${leaveErrors.reason ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                      placeholder="Brief reason for leave"
                      required
                    />
                    {leaveErrors.reason && (
                      <p className="mt-1 text-sm text-red-600">{leaveErrors.reason}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <div>
                    <input
                      type="date"
                      value={leaveForm.startDate}
                      onChange={(e) => {
                        setLeaveForm({ ...leaveForm, startDate: e.target.value });
                        if (leaveErrors.startDate) {
                          const startDate = new Date(e.target.value);
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          if (startDate >= today) {
                            setLeaveErrors({ ...leaveErrors, startDate: '' });
                          }
                        }
                      }}
                      className={`w-full px-3 py-2 border ${leaveErrors.startDate ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                    {leaveErrors.startDate && (
                      <p className="mt-1 text-sm text-red-600">{leaveErrors.startDate}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <div>
                    <input
                      type="date"
                      value={leaveForm.endDate}
                      onChange={(e) => {
                        setLeaveForm({ ...leaveForm, endDate: e.target.value });
                        if (leaveErrors.endDate) {
                          const endDate = new Date(e.target.value);
                          const startDate = new Date(leaveForm.startDate);
                          if (endDate >= startDate) {
                            setLeaveErrors({ ...leaveErrors, endDate: '' });
                          }
                        }
                      }}
                      className={`w-full px-3 py-2 border ${leaveErrors.endDate ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                      min={leaveForm.startDate || new Date().toISOString().split('T')[0]}
                      required
                    />
                    {leaveErrors.endDate && (
                      <p className="mt-1 text-sm text-red-600">{leaveErrors.endDate}</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Detailed Description <span className="text-red-500">*</span>
                </label>
                <div>
                  <textarea
                    value={leaveForm.description}
                    onChange={(e) => {
                      setLeaveForm({ ...leaveForm, description: e.target.value });
                      if (leaveErrors.description && e.target.value.trim().length >= 10) {
                        setLeaveErrors({ ...leaveErrors, description: '' });
                      }
                    }}
                    className={`w-full px-3 py-2 border ${leaveErrors.description ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                    rows={4}
                    placeholder="Provide detailed explanation for your leave request..."
                    required
                  />
                  {leaveErrors.description && (
                    <p className="mt-1 text-sm text-red-600">{leaveErrors.description}</p>
                  )}
                </div>
              </div>

              {leaveForm.startDate && leaveForm.endDate && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <Info className="w-5 h-5 text-blue-600 mr-2" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium">Leave Duration: {calculateLeaveDays(leaveForm.startDate, leaveForm.endDate)} days</p>
                      <p className="text-blue-600">
                        From {new Date(leaveForm.startDate).toLocaleDateString()} to {new Date(leaveForm.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Important Notes:</p>
                    <ul className="list-disc list-inside space-y-1 text-yellow-700">
                      <li>Leave applications must be submitted at least 24 hours in advance</li>
                      <li>Admin will review your application and send email notification</li>
                      <li>Emergency leaves may be approved with shorter notice</li>
                      <li>All fields marked with <span className="text-red-500">*</span> are required</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={resetLeaveForm}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={leaveSubmitting}
                  className={`px-6 py-2 ${leaveSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'} text-white rounded-lg transition-colors flex items-center space-x-2`}
                >
                  {leaveSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <CalendarDays className="w-4 h-4" />
                      <span>Submit Application</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="bg-gray-50 rounded-b-2xl h-2"></div>
          </div>
        </div>
      )}

      {/* Snackbar */}
      {snackbar.open && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
          snackbar.severity === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center justify-between">
            <span>{snackbar.message}</span>
            <button
              onClick={handleCloseSnackbar}
              className="ml-4 text-white hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;