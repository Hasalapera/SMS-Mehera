require('dotenv').config();
const express = require('express');
const cors = require('cors'); 
const { sequelize } = require('./models');
const { runMigrations } = require('./migrations/migrator');

// Routes Import
const userRoutes = require('./routes/userRoutes');
const supportRoutes = require('./routes/supportRoutes');
const brandRoutes = require('./routes/brandRoutes');
const productRoutes = require('./routes/productRoutes');
const customerRoutes = require('./routes/customerRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const orderRoutes = require('./routes/orderRoutes'); 
const aiRoutes = require('./routes/aiRoutes');
const contactRoutes = require('./routes/contactRoutes');
const errorHandler = require('./middlewares/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 5001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(cors({
  origin: 'http://localhost:5173', 
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], 
  credentials: true
}));

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
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/ask-ai', aiRoutes);
app.use('/api/contact', contactRoutes);

app.use(errorHandler);

// =====================================================
// DATABASE & SERVER STARTUP
// =====================================================

const startServer = async () => {
  try {
    console.log('\n🔗 Connecting to database...');
    await sequelize.authenticate();
    console.log('✓ Database connection successful');

    // 👈 REMOVE sync completely! Only authenticate
    // එක වෙලාවට ඔයා හදලා තිබුණු සෙට් අප් එක දැනටමත් උසස්:
    // සර්වර් එක NEVER sync කරන්න development වලත්!
    
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