import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/main-pages/LandingPage';
import LoginPage from './pages/main-pages/LoginPage';
import Dashboard from './pages/main-pages/Dashboard';
import Profile from './pages/main-pages/Profile';
import StockEntry from './pages/master/StockEntry';
import UserCreation from './pages/file/UserCreation';
import PurchaseEntry from './pages/master/PurchaseEntry';
import LogDetails from './pages/file/LogDetails';
import HelpCenter from './pages/file/HelpCenter';
import Vendor from './pages/master/Vendor';
import Enquiry from './pages/master/Enquiry';
import Customers from './pages/master/Customers';
import RawMaterialStockEntry from './pages/master/RawMaterialStockEntry';
import RawMaterialPurchaseEntry from './pages/master/RawMaterialPurchaseEntry';
import Quotation from './pages/billing/Quotation';
import Invoice from './pages/billing/Invoice';
import StockReturn from './pages/return-billing/StockReturn';
import CreditCollection from './pages/billing/CreditCollection';
import IncomeExpense from './pages/income-expense/IncomeExpense';
import Transactions from './pages/income-expense/Transactions';
import Assets from './pages/income-expense/Assets';
import BillReport from './pages/reports/BillReport';
import PurchaseReport from './pages/reports/PurchaseReport';
import DailyReport from './pages/reports/DailyReport';
import ReturnReport from './pages/reports/ReturnReport';
import RawMaterialPurchaseReport from './pages/reports/RawMaterialPurchaseReport';
import IncomeExpenseReport from './pages/reports/IncomeExpenseReport';
import CashBook from './pages/reports/CashBook';
import CreditCollectionReport from './pages/reports/CreditCollectionReport';

// Payroll Module Imports
import PayrollLayout from './layouts/PayrollLayout';
import PayrollDashboard from './pages/payroll/PayrollDashboard';
import EmployeeManagement from './pages/payroll/EmployeeManagement';
import AttendanceEntry from './pages/payroll/AttendanceEntry';
import SalaryProcessing from './pages/payroll/SalaryProcessing';
import PayrollReports from './pages/payroll/PayrollReports';

import NotFound from './pages/main-pages/NotFound';
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
                                <Route path="/stock-entry" element={<StockEntry />} />
                                <Route path="/purchase-entry" element={<PurchaseEntry />} />
                                <Route path="/user-creation" element={<UserCreation />} />
                                <Route path="/log-details" element={<LogDetails />} />
                                <Route path="/bill-report" element={<BillReport />} />
                                <Route path="/purchase-report" element={<PurchaseReport />} />
                                <Route path="/daily-report" element={<DailyReport />} />
                                <Route path="/return-report" element={<ReturnReport />} />
                                <Route path="/raw-material-purchase-report" element={<RawMaterialPurchaseReport />} />
                                <Route path="/income-expense-report" element={<IncomeExpenseReport />} />
                                <Route path="/cash-book" element={<CashBook />} />
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
                                <Route path="/credit-collection" element={<CreditCollection />} />
                                <Route path="/income-expense" element={<IncomeExpense />} />
                                <Route path="/transactions" element={<Transactions />} />
                                <Route path="/assets" element={<Assets />} />
                                <Route path="/credit-collection-report" element={<CreditCollectionReport />} />
                            </Route>
                            <Route element={<PayrollLayout />}>
                                <Route path="/payroll/dashboard" element={<PayrollDashboard />} />
                                <Route path="/payroll/employees" element={<EmployeeManagement />} />
                                <Route path="/payroll/attendance" element={<AttendanceEntry />} />
                                <Route path="/payroll/salary" element={<SalaryProcessing />} />
                                <Route path="/payroll/reports" element={<PayrollReports />} />
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
