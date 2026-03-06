const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const stockRoutes = require('./routes/stock.routes');
const logRoutes = require('./routes/log.routes');
const vendorRoutes = require('./routes/vendor.routes');
const purchaseRoutes = require('./routes/purchase.routes');
const enquiryRoutes = require('./routes/enquiry.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const customerRoutes = require('./routes/customer.routes');
const rawMaterialStockRoutes = require('./routes/rawMaterialStock.routes');
const rawMaterialPurchaseRoutes = require('./routes/rawMaterialPurchase.routes');
const quotationRoutes = require('./routes/quotation.routes');
const scaleUnitRoutes = require('./routes/scaleUnit.routes');
const invoiceRoutes = require('./routes/invoice.routes');
const stockReturnRoutes = require('./routes/stockReturn.routes');
const reportRoutes = require('./routes/report.routes');

const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'], // Frontend URLs
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/raw-material-stocks', rawMaterialStockRoutes);
app.use('/api/raw-material-purchases', rawMaterialPurchaseRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/scale-units', scaleUnitRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/stock-returns', stockReturnRoutes);
app.use('/api/reports', reportRoutes);

// Basic error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});

module.exports = app;
