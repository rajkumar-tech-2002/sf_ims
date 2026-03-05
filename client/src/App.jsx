import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import StockEntry from './pages/StockEntry';
import UserCreation from './pages/UserCreation';
import PurchaseEntry from './pages/PurchaseEntry';
import LogDetails from './pages/LogDetails';
import HelpCenter from './pages/HelpCenter';
import Vendor from './pages/Vendor';
import Enquiry from './pages/Enquiry';
import Customers from './pages/Customers';
import RawMaterialStockEntry from './pages/RawMaterialStockEntry';
import RawMaterialPurchaseEntry from './pages/RawMaterialPurchaseEntry';
import Quotation from './pages/Quotation';
import Invoice from './pages/Invoice';
import StockReturn from './pages/StockReturn';
import NotFound from './pages/NotFound';
import MainLayout from './layouts/MainLayout';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import PrivateRoute from './components/PrivateRoute';
import ToastContainer from './components/Toast';

function App() {
    return (
        <AuthProvider>
            <ToastProvider>
                <Router>
                    <ToastContainer />
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/login" element={<LoginPage />} />

                        <Route element={<PrivateRoute />}>
                            <Route element={<MainLayout />}>
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/inventory" element={<Inventory />} />
                                <Route path="/stock-entry" element={<StockEntry />} />
                                <Route path="/purchase-entry" element={<PurchaseEntry />} />
                                <Route path="/user-creation" element={<UserCreation />} />
                                <Route path="/log-details" element={<LogDetails />} />
                                <Route path="/reports" element={<Reports />} />
                                <Route path="/profile" element={<Profile />} />
                                <Route path="/help" element={<HelpCenter />} />
                                <Route path="/vendor" element={<Vendor />} />
                                <Route path="/enquiry" element={<Enquiry />} />
                                <Route path="/customers" element={<Customers />} />
                                <Route path="/raw-material-stock" element={<RawMaterialStockEntry />} />
                                <Route path="/raw-material-purchase" element={<RawMaterialPurchaseEntry />} />
                                <Route path="/quotation" element={<Quotation />} />
                                <Route path="/invoice" element={<Invoice />} />
                                <Route path="/stock-return" element={<StockReturn />} />
                            </Route>
                        </Route>

                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Router>
            </ToastProvider>
        </AuthProvider>
    );
}

export default App;
