import { Box, Typography, TextField, Button, Alert, Select, MenuItem, FormControl, InputLabel, FormHelperText } from "@mui/material";
import { useState } from "react";
import { FaSeedling, FaUpload, FaCamera } from "react-icons/fa";

function UploadHerb() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("0.00");
  const [stockWeight, setStockWeight] = useState("");
  const [quality, setQuality] = useState("Standard");
  const [grade, setGrade] = useState("Grade A");
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [uses, setUses] = useState("");
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    // Product Name
    if (!name.trim()) {
      newErrors.name = "Product name is required";
    } else if (name.trim().length < 2) {
      newErrors.name = "Product name must be at least 2 characters";
    }

    // Category
    if (!category.trim()) {
      newErrors.category = "Category is required";
    }

    // Price
    const priceStr = String(price || "").trim();
    const priceNum = parseFloat(priceStr);
    if (!priceStr || priceStr === "0.00") {
      newErrors.price = "Price is required";
    } else if (isNaN(priceNum)) {
      newErrors.price = "Price must be a valid number";
    } else if (priceNum <= 0) {
      newErrors.price = "Price must be a positive number";
    } else if (priceNum < 50) {
      newErrors.price = "Price must be at least ₹50.00";
    }

    // Stock Weight
    const weightStr = String(stockWeight || "").trim();
    const weightNum = parseFloat(weightStr);
    if (!weightStr) {
      newErrors.stockWeight = "Stock weight is required";
    } else if (isNaN(weightNum)) {
      newErrors.stockWeight = "Weight must be a valid number";
    } else if (weightNum < 0) {
      newErrors.stockWeight = "Weight cannot be negative";
    } else if (weightNum === 0) {
      newErrors.stockWeight = "Weight must be greater than 0";
    } else if (weightNum < 1) {
      newErrors.stockWeight = "Weight must be at least 1 gram";
    }

    // Description
    if (!description.trim()) {
      newErrors.description = "Description is required";
    } else if (description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    // Uses
    if (!uses.trim()) {
      newErrors.uses = "Uses are required";
    } else if (uses.trim().length < 5) {
      newErrors.uses = "Please provide at least one use";
    }

    // Image validation - either file or URL
    if (!image && !imageUrl.trim()) {
      newErrors.image = "Product image is required (upload file or enter URL)";
    } else if (imageUrl.trim() && !isValidUrl(imageUrl.trim())) {
      newErrors.imageUrl = "Please enter a valid image URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const setFieldError = (field, message) => {
    setErrors(prev => ({ ...prev, [field]: message }));
  };

  const handleSubmit = () => {
    console.log("Submit clicked, validating...");
    const isValid = validate();
    console.log("Validation result:", isValid);
    console.log("Current errors:", errors);
    if (!isValid) {
      console.log("Form is invalid, preventing submit");
      return;
    }
    console.log("Form is valid, proceeding with submit");
    // submit logic placeholder
  };

  const handleNameChange = (value) => {
    setName(value);
    if (!value.trim()) {
      setFieldError("name", "Product name is required");
    } else if (value.trim().length < 2) {
      setFieldError("name", "Product name must be at least 2 characters");
    } else {
      setFieldError("name", "");
    }
  };

  const handleCategoryChange = (value) => {
    setCategory(value);
    if (!value.trim()) {
      setFieldError("category", "Category is required");
    } else {
      setFieldError("category", "");
    }
  };

  const handlePriceChange = (value) => {
    setPrice(value);
    if (!value || value.trim() === "" || value === "0.00") {
      setFieldError("price", "Price is required");
    } else {
      const priceNum = parseFloat(value);
      if (isNaN(priceNum) || priceNum <= 0) {
        setFieldError("price", "Price must be a valid positive number");
      } else if (priceNum < 50) {
        setFieldError("price", "Price must be at least ₹50.00");
      } else {
        setFieldError("price", "");
      }
    }
  };

  const handleStockWeightChange = (value) => {
    setStockWeight(value);
    
    // Real-time validation as user types
    if (!value || value.trim() === "") {
      setFieldError("stockWeight", "Stock weight is required");
    } else if (value.includes('-')) {
      setFieldError("stockWeight", "Weight cannot be negative");
    } else {
      const weightNum = parseFloat(value);
      if (isNaN(weightNum)) {
        setFieldError("stockWeight", "Weight must be a valid number");
      } else if (weightNum < 0) {
        setFieldError("stockWeight", "Weight cannot be negative");
      } else if (weightNum === 0) {
        setFieldError("stockWeight", "Weight must be greater than 0");
      } else if (weightNum < 1) {
        setFieldError("stockWeight", "Weight must be at least 1 gram");
      } else {
        setFieldError("stockWeight", "");
      }
    }
  };

  const handleDescriptionChange = (value) => {
    setDescription(value);
    if (!value.trim()) {
      setFieldError("description", "Description is required");
    } else if (value.trim().length < 10) {
      setFieldError("description", "Description must be at least 10 characters");
    } else {
      setFieldError("description", "");
    }
  };

  const handleImageChange = (file) => {
    setImage(file);
    if (!file && !imageUrl.trim()) {
      setFieldError("image", "Product image is required (upload file or enter URL)");
    } else {
      setFieldError("image", "");
    }
  };

  const handleImageUrlChange = (value) => {
    setImageUrl(value);
    if (!value.trim() && !image) {
      setFieldError("image", "Product image is required (upload file or enter URL)");
    } else if (value.trim() && !isValidUrl(value.trim())) {
      setFieldError("imageUrl", "Please enter a valid image URL");
    } else {
      setFieldError("image", "");
      setFieldError("imageUrl", "");
    }
  };

  const handleUsesChange = (value) => {
    setUses(value);
    if (!value.trim()) {
      setFieldError("uses", "Uses are required");
    } else if (value.trim().length < 5) {
      setFieldError("uses", "Please provide at least one use");
    } else {
      setFieldError("uses", "");
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fa", py: 4 }}>
      <Box sx={{ maxWidth: 800, mx: "auto", p: 4, bgcolor: "white", borderRadius: 2, boxShadow: 1 }}>
        {/* Header */}
        <Box sx={{ bgcolor: "#10b981", color: "white", p: 2, borderRadius: 1, mb: 4 }}>
          <Typography variant="h5" fontWeight={700} textAlign="center">
            Add New Product
          </Typography>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Product Name */}
          <TextField 
            fullWidth 
            label="Product Name *" 
            value={name} 
            onChange={e => handleNameChange(e.target.value)} 
            error={!!errors.name} 
            helperText={errors.name} 
            placeholder="Enter product name"
          />

          {/* Category */}
          <FormControl fullWidth error={!!errors.category}>
            <InputLabel>Category *</InputLabel>
            <Select
              value={category}
              onChange={e => handleCategoryChange(e.target.value)}
              label="Category *"
            >
              <MenuItem value="">Select Category</MenuItem>
              <MenuItem value="Herbs">Herbs</MenuItem>
              <MenuItem value="Medicines">Medicines</MenuItem>
              <MenuItem value="Spices">Spices</MenuItem>
              <MenuItem value="Teas">Teas</MenuItem>
              <MenuItem value="Supplements">Supplements</MenuItem>
            </Select>
            {errors.category && <FormHelperText>{errors.category}</FormHelperText>}
          </FormControl>

          {/* Price */}
          <TextField 
            fullWidth 
            label="Price (₹) *" 
            type="number" 
            value={price} 
            onChange={e => handlePriceChange(e.target.value)} 
            error={!!errors.price} 
            helperText={errors.price || "Minimum ₹50.00"} 
            inputProps={{ min: "50", step: "0.01" }}
          />

          {/* Stock Weight */}
          <TextField 
            fullWidth 
            label="Stock Weight (grams) *" 
            type="number" 
            value={stockWeight} 
            onChange={e => handleStockWeightChange(e.target.value)} 
            error={!!errors.stockWeight} 
            helperText={errors.stockWeight || "Enter weight in grams (1000g = 1kg)"} 
            placeholder="Enter weight in grams (e.g., 500)"
            inputProps={{ min: "1", step: "1" }}
          />

          {/* Quality and Grade Row */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Quality</InputLabel>
              <Select
                value={quality}
                onChange={e => setQuality(e.target.value)}
                label="Quality"
              >
                <MenuItem value="Standard">Standard</MenuItem>
                <MenuItem value="Premium">Premium</MenuItem>
                <MenuItem value="Organic">Organic</MenuItem>
                <MenuItem value="Wild">Wild</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Grade</InputLabel>
              <Select
                value={grade}
                onChange={e => setGrade(e.target.value)}
                label="Grade"
              >
                <MenuItem value="Grade A">Grade A</MenuItem>
                <MenuItem value="Grade B">Grade B</MenuItem>
                <MenuItem value="Grade C">Grade C</MenuItem>
                <MenuItem value="Premium">Premium</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Product Image Upload */}
          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Product Image *
            </Typography>
            <Box
              sx={{
                border: "2px dashed #d1d5db",
                borderRadius: 2,
                p: 4,
                textAlign: "center",
                cursor: "pointer",
                "&:hover": { borderColor: "#10b981" }
              }}
              component="label"
            >
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={e => handleImageChange(e.target.files[0])}
              />
              <FaCamera sx={{ fontSize: 40, color: "#9ca3af", mb: 2 }} />
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Click to upload or drag and drop
              </Typography>
              <Typography variant="caption" color="text.secondary">
                PNG, JPG, GIF up to 5MB
              </Typography>
            </Box>
            {errors.image && <Typography variant="caption" color="error" sx={{ mt: 1, display: "block" }}>{errors.image}</Typography>}
          </Box>

          {/* Image URL Alternative */}
          <TextField 
            fullWidth 
            label="Or enter image URL" 
            value={imageUrl} 
            onChange={e => handleImageUrlChange(e.target.value)} 
            error={!!errors.imageUrl} 
            helperText={errors.imageUrl || "Optional"} 
            placeholder="https://example.com/image.jpg"
          />

          {/* Description */}
          <TextField 
            fullWidth 
            label="Description *" 
            value={description} 
            onChange={e => handleDescriptionChange(e.target.value)} 
            error={!!errors.description} 
            helperText={errors.description || "Enter product description"} 
            multiline 
            rows={4}
            placeholder="Enter product description"
          />

          {/* Uses */}
          <TextField 
            fullWidth 
            label="Uses (comma separated) *" 
            value={uses} 
            onChange={e => handleUsesChange(e.target.value)} 
            error={!!errors.uses} 
            helperText={errors.uses || "Enter uses separated by commas"} 
            placeholder="Digestive, Anti-inflammatory, Antioxidant"
          />

          {/* Product Guidelines */}
          <Box sx={{ 
            bgcolor: "#e0f2fe", 
            border: "1px solid #b3e5fc", 
            borderRadius: 2, 
            p: 3,
            display: "flex",
            alignItems: "flex-start",
            gap: 2
          }}>
            <Box sx={{ 
              bgcolor: "#0288d1", 
              color: "white", 
              borderRadius: "50%", 
              width: 24, 
              height: 24, 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              fontSize: "14px", 
              fontWeight: "bold",
              flexShrink: 0,
              mt: 0.5
            }}>
              i
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1, color: "#01579b" }}>
                Product Guidelines:
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2, color: "#01579b" }}>
                <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                  Fields marked with * are required
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                  Enter stock weight in grams (e.g., 500g = 0.5kg)
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                  Price should be per gram (customers buy by weight)
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                  Use high-quality images for better product visibility
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                  Provide detailed descriptions to help customers understand your product
                </Typography>
                <Typography component="li" variant="body2">
                  List specific uses to help customers find your product through search
        </Typography>
              </Box>
            </Box>
          </Box>

          {/* Submit Button */}
          <Button 
            variant="contained" 
            onClick={handleSubmit} 
            disabled={Object.keys(errors).some(key => errors[key])}
            sx={{ 
              bgcolor: Object.keys(errors).some(key => errors[key]) ? "#ccc" : "#10b981", 
              color: "white", 
              py: 1.5,
              fontSize: "1.1rem",
              fontWeight: 600,
              "&:disabled": {
                bgcolor: "#ccc",
                color: "#666"
              },
              "&:hover": {
                bgcolor: Object.keys(errors).some(key => errors[key]) ? "#ccc" : "#059669"
              }
            }} 
            fullWidth
          >
            Add Product
        </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default UploadHerb; 