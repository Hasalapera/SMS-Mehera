require('dotenv').config();
const express = require('express');
const cors = require('cors'); 
const { sequelize } = require('./models');
const { runMigrations } = require('./utils/migrator');

// Routes Import
const userRoutes = require('./routes/userRoutes');
const supportRoutes = require('./routes/supportRoutes');
const brandRoutes = require('./routes/brandRoutes');
const productRoutes = require('./routes/productRoutes');
const stockRoutes = require('./routes/stockRoutes');  
const customerRoutes = require('./routes/customerRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const orderRoutes = require('./routes/orderRoutes'); 
const aiRoutes = require('./routes/aiRoutes');
const contactRoutes = require('./routes/contactRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const errorHandler = require('./middlewares/errorMiddleware');
const settingRoutes = require('./routes/settingRoutes');
const reportRoutes = require('./routes/reportRoutes');
const workshopRoutes = require('./routes/workshopRoutes');
const salesTargetRoutes = require('./routes/salesTargetRoutes');


const app = express();
const PORT = process.env.PORT || 5001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// =====================================================
// MIDDLEWARE
// =====================================================

// 1. CORS මුලින්ම තියෙන්න ඕනේ හැම රූට් එකකටම කලින් 🛠️
app.use(cors({
  origin: 'http://localhost:5173', 
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], 
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Request logging (development only)
if (NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method.padEnd(6)} ${req.path}`);
    next();
  });
}

// =====================================================
// ROUTES
// =====================================================

app.get('/', (req, res) => {
    res.json({
      message: "✅ Mehera Backend API Server",
      version: "1.0.0",
      environment: NODE_ENV
    });
});

app.use('/api/users', userRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/stock', stockRoutes); 
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/ask-ai', aiRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/settings', settingRoutes); 
app.use('/api/notifications', notificationRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/salesTarget', salesTargetRoutes);

// ✅ Workshop Route එක අනිත් රූට්ස් තියෙන තැනටම පිළිවෙළට දැම්මා
app.use('/api/workshops', workshopRoutes);

app.use(errorHandler);

// =====================================================
// DATABASE & SERVER STARTUP
// =====================================================

const startServer = async () => {
  try {
    console.log('\n🔗 Connecting to database...');
    await sequelize.authenticate();
    console.log('✓ Database connection successful');
    console.log('✓ Database ready');

    // Start server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n${'='.repeat(50)}`);
      console.log(`🚀 Server started successfully`);
      console.log(`${'='.repeat(50)}`);
      console.log(`📍 Port: ${PORT}`);
      console.log(`🌍 Environment: ${NODE_ENV}`);
      console.log(`📅 Started: ${new Date().toLocaleString()}`);
      console.log(`${'='.repeat(50)}\n`);
    });

  } catch (error) {
    console.error('\n❌ Server startup failed:');
    console.error(error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;