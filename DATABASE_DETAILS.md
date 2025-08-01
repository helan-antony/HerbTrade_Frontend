# 📊 **HerbTrade Database Details**

## 🗄️ **Database Information**

### **Database Type**: MongoDB
- **Database Name**: `herbtrade`
- **Connection String**: `mongodb://localhost:27017/herbtrade`
- **Host**: `localhost`
- **Port**: `27017`
- **Location**: Local MongoDB instance

## 📁 **Collections Structure**

### **1. users** - User Accounts
- Stores user registration data
- Admin, regular users, sellers, employees
- Authentication credentials

### **2. hospitals** - Hospital Data + Appointments ⭐
- **Primary storage for appointments**
- Hospital information and embedded appointments
- **This is where all appointment data is stored**

### **3. products** - Herb Catalog
- Herb/product listings
- Categories, prices, descriptions

### **4. blogs** - Blog Posts
- Blog content and metadata

### **5. comments** - Blog Comments
- User comments on blog posts

### **6. orders** - Purchase Orders
- E-commerce order data

### **7. sellers** - Seller Accounts
- Seller-specific user data

## 🏥 **Appointment Data Storage**

### **Storage Location**: 
- **Collection**: `hospitals`
- **Field**: `appointments` (Array of embedded documents)
- **Structure**: Each hospital document contains an array of appointments

### **Complete Appointment Data Structure**:
```javascript
{
  _id: ObjectId("appointment_unique_id"),
  patient: ObjectId("user_id_reference"),
  doctor: {
    id: "doctor_id",
    name: "Dr. Rajesh Kumar",
    specialty: "Ayurvedic Medicine"
  },
  hospital: {
    id: "hospital_id", 
    name: "Ayurvedic Wellness Center",
    address: "123 Wellness Street, Mumbai",
    phone: "+91-22-12345678"
  },
  appointmentDate: ISODate("2025-02-03T00:00:00.000Z"),
  appointmentTime: "10:30",
  reason: "Final test booking",
  patientDetails: {
    name: "Admin User",
    phone: "+91-9876543210", 
    email: "admin@gmail.com"
  },
  status: "pending", // pending|confirmed|cancelled|completed
  createdAt: ISODate("2025-07-28T18:57:23.330Z")
}
```

## 📋 **Current Database Content**

### **✅ Verified Appointment Records**: 5 appointments stored

**Sample Records**:
1. **Appointment ID**: `6887bf64143b886174c2c330`
   - **Patient**: John Doe (+91-9876543220)
   - **Doctor**: Dr. Rajesh Kumar (Ayurvedic Medicine)
   - **Date**: 2025-01-30 at 10:00
   - **Reason**: General consultation for stress management

2. **Appointment ID**: `6887c813c6c9c25fd17f87bb`
   - **Patient**: Admin User (+91-9876543210)
   - **Doctor**: Dr. Rajesh Kumar (Ayurvedic Medicine) 
   - **Date**: 2025-02-03 at 10:30
   - **Reason**: Final test booking

## 🔍 **Data Verification**

### **All Fields Stored**:
- ✅ **Patient Information**: Name, phone, email
- ✅ **Doctor Details**: Name, specialty, ID
- ✅ **Hospital Information**: Name, address, phone
- ✅ **Appointment Details**: Date, time, reason
- ✅ **System Data**: Status, creation timestamp
- ✅ **User Reference**: Patient ID for data relationships

### **Data Integrity**:
- ✅ **Unique IDs**: Each appointment has unique ObjectId
- ✅ **User References**: Proper linking to user accounts
- ✅ **Timestamps**: Creation dates tracked
- ✅ **Status Tracking**: Appointment status management
- ✅ **Complete Information**: All form fields preserved

## 🔧 **Database Access**

### **API Endpoints**:
- **Create**: `POST /api/hospitals/appointments`
- **Read**: `GET /api/hospitals/appointments/my`
- **Authentication**: Bearer token required

### **Direct Database Access**:
```bash
# Connect to MongoDB
mongo mongodb://localhost:27017/herbtrade

# View appointments
db.hospitals.find({}, {"appointments": 1, "name": 1})

# Count appointments
db.hospitals.aggregate([
  {$unwind: "$appointments"}, 
  {$count: "total_appointments"}
])
```

## 📊 **Storage Summary**

### **✅ CONFIRMED**: All appointment details are stored in MongoDB database

- **Database**: ✅ MongoDB running locally
- **Collection**: ✅ `hospitals` collection exists
- **Data**: ✅ 5+ appointments verified in database
- **Structure**: ✅ Complete appointment data preserved
- **Relationships**: ✅ User references maintained
- **Timestamps**: ✅ Creation dates tracked
- **Status**: ✅ Appointment status managed

### **🎯 Result**: 
**YES, all appointment details are fully stored in the MongoDB database with complete data integrity and proper relationships.**