// TODO: Main Express server entry point

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middlewares
app.use(cors({
  origin: [process.env.CLIENT_URL, 'http://localhost:5174', 'http://localhost:5173'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder for uploaded files (logos, signatures)
app.use('/uploads', express.static('storage/uploads'));

// Health check route
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'PDF Engine API is running',
    version: '1.0.0'
  });
});

// Routes
app.use('/api/auth',      require('./routes/authRoutes'));
// app.use('/api/users',     require('./routes/userRoutes'));
// app.use('/api/templates', require('./routes/templateRoutes'));
// app.use('/api/documents', require('./routes/documentRoutes'));
// app.use('/api/esign',     require('./routes/esignRoutes'));
// app.use('/api/delivery',  require('./routes/deliveryRoutes'));
// app.use('/api/verify',    require('./routes/verifyRoutes'));
// app.use('/api/audit',     require('./routes/auditRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
