# HerbTrade AI - Complete Ayurvedic Ecosystem Platform

## 🌿 Overview
HerbTrade AI is a comprehensive Ayurvedic ecosystem platform that combines herb trading, hospital discovery, doctor consultations, and AI-powered health solutions. The platform features separate MongoDB collections for wishlist, cart, and hospital bookings, along with an enhanced admin dashboard for complete user and employee management.

## 🚀 Features

### Core Platform Features
- **Herb Marketplace**: Browse and purchase premium Ayurvedic herbs with quality assurance
- **Hospital Discovery**: Find nearby Ayurvedic hospitals with location-based search
- **Doctor Consultation**: Book appointments with certified Ayurvedic doctors
- **AI Health Assistant**: Get instant health advice and herb recommendations
- **Community Blog**: Read expert articles and engage with the community
- **Business Analytics**: Track orders, manage inventory, and analyze trends

### User Management Features
- **Multi-role Authentication**: Admin, Seller, Employee, and User roles
- **Profile Management**: Complete user profile with edit capabilities
- **Wishlist & Cart**: Separate collections for enhanced shopping experience
- **Hospital Bookings**: Multi-step booking process with payment integration

### Admin Features
- **User Management**: View, enable/disable users with detailed statistics
- **Employee Management**: Add employees with automatic email notifications
- **Hospital Booking Management**: Track and manage all bookings
- **Platform Analytics**: Comprehensive dashboard with real-time statistics
- **Export Functionality**: Export user and booking data

## 📊 Database Schema (MongoDB Collections)

### 1. Users Collection
```javascript
{
  name: String,
  email: String,
  password: String,
  phone: String,
  role: String, // 'user', 'admin', 'seller', 'employee'
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Sellers Collection
```javascript
{
  name: String,
  email: String,
  password: String,
  role: String, // 'seller', 'employee', 'manager', 'supervisor'
  department: String,
  isActive: Boolean,
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### 3. Wishlist Collection
```javascript
{
  userId: ObjectId,
  items: [{
    productId: ObjectId,
    addedAt: Date,
    productName: String,
    productImage: String,
    productPrice: Number,
    productCategory: String
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### 4. Cart Collection
```javascript
{
  userId: ObjectId,
  items: [{
    productId: ObjectId,
    quantity: Number,
    price: Number,
    productName: String,
    productImage: String,
    productCategory: String,
    addedAt: Date
  }],
  totalAmount: Number,
  totalItems: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### 5. Hospital Booking Collection
```javascript
{
  userId: ObjectId,
  hospitalId: ObjectId,
  patientDetails: {
    name: String,
    age: Number,
    gender: String,
    phone: String,
    email: String,
    address: String
  },
  appointmentDetails: {
    doctorName: String,
    department: String,
    appointmentDate: Date,
    appointmentTime: String,
    consultationType: String
  },
  medicalInfo: {
    symptoms: String,
    medicalHistory: String,
    currentMedications: String,
    allergies: String,
    emergencyContact: {
      name: String,
      phone: String,
      relation: String
    }
  },
  bookingStatus: String,
  paymentDetails: {
    consultationFee: Number,
    paymentStatus: String,
    paymentMethod: String,
    transactionId: String
  },
  hospitalDetails: {
    name: String,
    address: String,
    phone: String,
    email: String
  },
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔧 Backend API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /forgot-password` - Password reset request
- `POST /reset-password` - Password reset confirmation

### User Routes (`/api/users`)
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `PUT /change-password` - Change password

### Wishlist Routes (`/api/wishlist`)
- `GET /` - Get user's wishlist
- `POST /add` - Add item to wishlist
- `DELETE /remove/:productId` - Remove item from wishlist
- `DELETE /clear` - Clear entire wishlist

### Cart Routes (`/api/cart`)
- `GET /` - Get user's cart
- `POST /add` - Add item to cart
- `PUT /update/:productId` - Update item quantity
- `DELETE /remove/:productId` - Remove item from cart
- `DELETE /clear` - Clear entire cart

### Hospital Booking Routes (`/api/hospital-bookings`)
- `GET /` - Get user's bookings
- `GET /:bookingId` - Get specific booking
- `POST /create` - Create new booking
- `PUT /:bookingId/status` - Update booking status
- `PUT /:bookingId/payment` - Update payment status
- `PUT /:bookingId/cancel` - Cancel booking
- `GET /stats/summary` - Get booking statistics

### Admin Routes (`/api/admin`)
- `GET /users` - Get all users with detailed stats
- `PUT /users/:userId/toggle-status` - Enable/disable user
- `GET /users/:userId/details` - Get detailed user information
- `POST /add-employee` - Add new employee with email notification
- `GET /employees` - Get all employees
- `GET /sellers` - Get all sellers
- `GET /stats` - Get platform statistics
- `GET /orders` - Get all orders

## 🎨 Frontend Components

### Core Pages
- **Landing.jsx** - Homepage with platform overview
- **Login.jsx** - User authentication
- **Signup.jsx** - User registration
- **Dashboard.jsx** - User dashboard
- **Profile.jsx** - User profile management
- **HerbCatalog.jsx** - Herb browsing and purchasing
- **HospitalDiscovery.jsx** - Hospital search and discovery

### Enhanced Components
- **EnhancedWishlist.jsx** - Full-featured wishlist with API integration
- **EnhancedCart.jsx** - Complete shopping cart with checkout
- **HospitalBooking.jsx** - Multi-step booking process
- **EnhancedAdminDashboard.jsx** - Comprehensive admin panel

### Admin Features
- **User Management**: View, enable/disable users with activity statistics
- **Employee Management**: Add employees with automatic email notifications
- **Hospital Booking Management**: Track and manage all bookings
- **Platform Analytics**: Real-time statistics and insights
- **Export Functionality**: Export data for reporting

## 🔐 Security Features

### Authentication & Authorization
- JWT token-based authentication
- Role-based access control (Admin, Seller, Employee, User)
- Protected routes with middleware
- Session management

### Data Security
- Password hashing with bcrypt
- Input validation and sanitization
- SQL injection prevention
- XSS protection

### Email Security
- Secure email configuration with environment variables
- Professional email templates
- Automatic credential generation for employees

## 📧 Email System

### Employee Onboarding Email
When admin adds a new employee, an automated email is sent containing:
- Welcome message with company branding
- Login credentials (email and generated password)
- Role and department information
- Login instructions and dashboard access
- Professional HTML template with HerbTrade AI branding

### Email Configuration
```javascript
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Gmail account for email notifications

### Backend Setup
1. Clone the repository
2. Navigate to backend directory: `cd backend`
3. Install dependencies: `npm install`
4. Create `.env` file with required variables:
   ```
   MONGODB_URI=mongodb://localhost:27017/herbtrade
   JWT_SECRET=your_jwt_secret_key
   EMAIL_USER=your_gmail_address
   EMAIL_PASS=your_gmail_app_password
   ```
5. Start the server: `npm start`

### Frontend Setup
1. Navigate to frontend directory: `cd HerbTrade`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

### Environment Variables
```
MONGODB_URI=mongodb://localhost:27017/herbtrade
JWT_SECRET=your_jwt_secret_key_here
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
PORT=5000
```

## 👨‍💼 Admin Access

### Default Admin Credentials
- **Email**: `admin@gmail.com`
- **Password**: `admin@123`

### Admin Capabilities
- **User Management**: View all users, enable/disable accounts, view detailed statistics
- **Employee Management**: Add new employees with automatic email notifications
- **Hospital Booking Management**: Track all bookings, update statuses
- **Platform Analytics**: View comprehensive statistics and insights
- **Data Export**: Export user and booking data for reporting

## 🎯 User Roles & Permissions

### Admin
- Full platform access
- User and employee management
- System configuration
- Analytics and reporting

### Seller
- Product management
- Order processing
- Inventory tracking
- Sales analytics

### Employee
- Limited admin functions
- Customer support
- Order assistance
- Basic reporting

### User
- Browse and purchase herbs
- Book hospital appointments
- Manage wishlist and cart
- Access AI chatbot

## 📱 Responsive Design

### Mobile Optimization
- Touch-friendly interfaces
- Responsive layouts for all screen sizes
- Mobile-first design approach
- Optimized loading times

### Cross-Platform Compatibility
- Works on all modern browsers
- Progressive Web App features
- Offline functionality for key features
- Fast loading with optimized assets

## 🔄 API Integration

### Real-time Features
- Live cart and wishlist updates
- Real-time booking status changes
- Instant notifications
- Dynamic content loading

### Error Handling
- Graceful error handling with user-friendly messages
- Fallback to localStorage for demo purposes
- Retry mechanisms for failed requests
- Loading states and progress indicators

## 📊 Analytics & Reporting

### User Analytics
- Registration and activity tracking
- Cart abandonment analysis
- Popular herbs and categories
- User engagement metrics

### Business Analytics
- Revenue tracking
- Order fulfillment rates
- Hospital booking statistics
- Employee performance metrics

## 🎨 UI/UX Features

### Design System
- Material-UI components
- Consistent color scheme and typography
- Professional branding
- Accessibility compliance

### User Experience
- Intuitive navigation
- Quick actions and shortcuts
- Search and filter capabilities
- Personalized recommendations

## 🔧 Development Features

### Code Quality
- Clean, commented code
- Modular architecture
- Reusable components
- Best practices implementation

### Testing
- Unit tests for critical functions
- Integration tests for API endpoints
- End-to-end testing for user flows
- Performance testing

## 📈 Future Enhancements

### Planned Features
- Advanced AI recommendations
- Multi-language support
- Payment gateway integration
- Mobile app development
- Advanced analytics dashboard
- Inventory management system

### Scalability
- Microservices architecture
- Cloud deployment ready
- Database optimization
- Caching implementation

## 🤝 Contributing

### Development Guidelines
- Follow existing code patterns
- Write comprehensive tests
- Update documentation
- Follow Git best practices

### Code Standards
- ESLint configuration
- Prettier formatting
- TypeScript support
- Component documentation

## 📞 Support

### Technical Support
- Email: support@herbtrade.ai
- Documentation: Available in `/docs`
- Issue tracking: GitHub Issues
- Community forum: Available on platform

### Business Inquiries
- Email: business@herbtrade.ai
- Phone: +91 98765 43210
- Address: HerbTrade AI Headquarters

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Ayurvedic medicine practitioners for domain expertise
- Open source community for tools and libraries
- Beta testers for valuable feedback
- Design inspiration from modern e-commerce platforms

---

**HerbTrade AI** - Revolutionizing Ayurvedic healthcare through technology
Version 2.0 | Last Updated: January 2024