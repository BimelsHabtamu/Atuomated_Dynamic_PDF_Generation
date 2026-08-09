const express = require('express');
const cors    = require('cors');
const dotenv  = require('dotenv');
const path    = require('path');
const fs      = require('fs');

dotenv.config();

const app = express();

const pdfDir = path.join(__dirname, 'storage/pdfs');
const uplDir = path.join(__dirname, 'storage/uploads');
if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });
if (!fs.existsSync(uplDir)) fs.mkdirSync(uplDir, { recursive: true });

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin.startsWith('http://localhost')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uplDir));

app.get('/', (req, res) => {
  res.json({
    status:  'ok',
    message: 'PDF Engine API is running',
    version: '1.0.0',
    routes: [
      'POST   /api/auth/login',
      'GET    /api/auth/me',
      'GET    /api/users',
      'POST   /api/users',
      'GET    /api/templates',
      'POST   /api/templates',
      'POST   /api/documents/generate',
      'POST   /api/documents/preview',
      'GET    /api/documents',
      'POST   /api/esign/request',
      'POST   /api/esign/otp/send',
      'POST   /api/esign/otp/verify',
      'POST   /api/esign/approve',
      'POST   /api/esign/reject',
      'GET    /api/esign/pending',
      'POST   /api/delivery/deliver',
      'GET    /api/delivery/download',
      'GET    /api/verify/:doc_uuid',
      'POST   /api/verify/upload',
      'GET    /api/audit',
      'GET    /api/audit/dashboard',
    ]
  });
});

app.use('/api/auth',          require('./routes/authRoutes'));
app.use('/api/users',         require('./routes/userRoutes'));
app.use('/api/templates',     require('./routes/templateRoutes'));
app.use('/api/documents',     require('./routes/documentRoutes'));
app.use('/api/esign',         require('./routes/esignRoutes'));
app.use('/api/delivery',      require('./routes/deliveryRoutes'));
app.use('/api/verify',        require('./routes/verifyRoutes'));
app.use('/api/audit',         require('./routes/auditRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.url} not found` });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
