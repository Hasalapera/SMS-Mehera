require('dotenv').config();
const express = require('express');
const cors = require('cors'); // ✅ මෙතන විතරක් තිබුණාම ඇති
const { sequelize } = require('./models');

// Routes Import
const userRoutes = require('./routes/userRoutes');
const supportRoutes = require('./routes/supportRoutes');
const brandRoutes = require('./routes/brandRoutes');
const productRoutes = require('./routes/productRoutes');
const customerRoutes = require('./routes/customerRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const orderRoutes = require('./routes/orderRoutes'); 
const aiRoutes = require('./routes/aiRoutes'); // ✅ AI Route එක Import කරන්න

const errorHandler = require('./middlewares/errorMiddleware');

const app = express();

// ✅ Image Upload සඳහා ලිමිට් එක මෙතන පමණක් දාන්න
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ✅ CORS එක පාරක් පමණක් Configure කරන්න
app.use(cors({
  origin: 'http://localhost:5173', 
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], 
  credentials: true
}));

// Logging Middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

app.get('/', (req, res) => {
    res.send("Server is working perfectly with Sequelize!");
});

// Routes Registration
app.use('/api/users', userRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/ask-ai', aiRoutes); // ✅ AI Endpoint එක register කරන්න

// Error Handling (අන්තිමටම තියෙන්න ඕනේ)
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

// Sync database and start server
sequelize.sync({ alter: true })
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to sync database:', err);
    process.exit(1);
  });