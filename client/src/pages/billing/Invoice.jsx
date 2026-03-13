import React, { useState, useEffect, useCallback } from 'react';
import {
    Plus,
    Trash2,
    Save,
    Printer,
    RotateCcw,
    Search,
    User,
    Hash,
    Calendar,
    FileText,
    Percent,
    IndianRupee,
    Calculator,
    Edit2,
    ChevronDown,
    ChevronUp,
    AlertCircle,
    Download,
    Receipt,
    Phone,
    MapPin
} from 'lucide-react';
import api from '../../utils/api';
import DataTable from '../../components/DataTable';
import { useToast } from '../../context/ToastContext';
import { usePermissions } from '../../hooks/usePermissions';
import InvoicePrint from '../../components/reports/InvoicePrint';

const AutoResizeInput = ({ value, onChange, placeholder, type = 'text', className = '', ...props }) => {
    const getWidth = () => {
        // If className specifies a width (e.g. w-32), don't auto-resize
        if (className.includes('w-')) return undefined;

        const charCount = Math.max(value?.toString().length || 0, placeholder?.length || 1, 4);
        return `calc(${charCount}ch + 1.5rem)`;
    };

    return (
        <div className={`relative flex items-center bg-slate-50/80 border border-slate-200 rounded-xl transition-all hover:bg-white focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 group ${className}`} style={getWidth() ? { width: getWidth() } : {}}>
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full bg-transparent px-2 py-2.5 text-sm font-bold text-slate-700 outline-none placeholder:text-slate-300 transition-all placeholder:font-normal"
                {...props}
            />
        </div>
    );
};

const Invoice = () => {
    const { showToast, confirmToast } = useToast();
    const { canEdit, isViewOnly } = usePermissions();
    const moduleId = 'invoice';
    const [loading, setLoading] = useState(false);
    const [invoices, setInvoices] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showTable, setShowTable] = useState(false);
    const [customerList, setCustomerList] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);
    // Product code autocomplete
    const [stockList, setStockList] = useState([]);
    const [productSuggestions, setProductSuggestions] = useState({});
    const [activeProductIndex, setActiveProductIndex] = useState(null);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

    // Import State
    const [importQuotationNo, setImportQuotationNo] = useState('');
    const [quotationList, setQuotationList] = useState([]);
    const [quotationSuggestions, setQuotationSuggestions] = useState([]);
    const [showQuotationSuggestions, setShowQuotationSuggestions] = useState(false);
    const [importDropdownPos, setImportDropdownPos] = useState({ top: 0, left: 0 });

    // Header State
    const [invoiceNo, setInvoiceNo] = useState('');
    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);

    // Customer State
    const [customer, setCustomer] = useState({
        id: '',
        name: '',
        gstNo: '',
        address: '',
        mobile: '',
        contact: '',
        state: '',
        stateCode: ''
    });

    // Grid State
    const [items, setItems] = useState([{
        id: Date.now(),
        productCode: '',
        productName: '',
        hsnCode: '',
        description: '',
        qty: 1,
        price: 0,
        scale: '',
        discountPercent: 0,
        gstPercent: 0,
        taxableAmount: 0,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 0,
        amount: 0,
        totalAmount: 0
    }]);

    const [gstMode, setGstMode] = useState('CGST_SGST');
    const [isCredit, setIsCredit] = useState(false);

    const [totals, setTotals] = useState({
        subtotal: 0,
        gstTotal: 0,
        roundOff: 0,
        grandTotal: 0
    });

    const fetchNextNo = async () => {
        try {
            const response = await api.get('/invoices/next-no');
            setInvoiceNo(response.data.nextNo);
        } catch (error) {
            console.error('Error fetching next invoice number');
        }
    };

    // Fetch Next Customer ID
    const fetchNextCustomerId = async () => {
        try {
            const response = await api.get('/customers/next-id');
            setCustomer(prev => ({ ...prev, id: response.data.nextId }));
        } catch (error) {
            console.error('Error fetching next customer ID', error);
        }
    };

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const response = await api.get('/invoices/detailed');
            setInvoices(response.data);
        } catch (error) {
            showToast('error', 'Failed to fetch invoice records');
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomerList = async () => {
        try {
            const response = await api.get('/customers');
            setCustomerList(response.data);
        } catch (error) {
            console.error('Error fetching customer list', error);
        }
    };

    const fetchQuotationsList = async () => {
        try {
            const response = await api.get('/quotations');
            setQuotationList(response.data);
        } catch (error) {
            console.error('Error fetching quotations list', error);
        }
    };

    useEffect(() => {
        fetchNextNo();
        fetchInvoices();
        fetchCustomerList();
        fetchNextCustomerId();
        fetchQuotationsList();
    }, []);

    const fetchStockList = async () => {
        try {
            const res = await api.get('/stocks');
            setStockList(res.data);
        } catch (e) { console.error('stock list', e); }
    };

    useEffect(() => { fetchStockList(); }, []);

    const calculateItem = useCallback((item, mode) => {
        const qty = parseFloat(item.qty) || 0;
        const price = parseFloat(item.price) || 0;
        const discountPercent = parseFloat(item.discountPercent) || 0;
        const gstPercent = parseFloat(item.gstPercent) || 0;

        const amount = qty * price;
        const discountAmount = (amount * discountPercent) / 100;
        const taxableAmount = amount - discountAmount;

        let cgstAmount = 0;
        let sgstAmount = 0;
        let igstAmount = 0;

        if (mode === 'CGST_SGST') {
            cgstAmount = (taxableAmount * (gstPercent / 2)) / 100;
            sgstAmount = (taxableAmount * (gstPercent / 2)) / 100;
        } else {
            igstAmount = (taxableAmount * gstPercent) / 100;
        }

        const totalAmount = taxableAmount + cgstAmount + sgstAmount + igstAmount;

        return {
            ...item,
            taxableAmount: taxableAmount.toFixed(2),
            cgstAmount: cgstAmount.toFixed(2),
            sgstAmount: sgstAmount.toFixed(2),
            igstAmount: igstAmount.toFixed(2),
            amount: amount.toFixed(2),
            totalAmount: totalAmount.toFixed(2)
        };
    }, []);

    // Calculate totals whenever items or mode change
    useEffect(() => {
        const subtotal = items.reduce((acc, curr) => acc + (parseFloat(curr.taxableAmount) || 0), 0);
        const gstTotal = items.reduce((acc, curr) => acc + (parseFloat(curr.cgstAmount) || 0 + parseFloat(curr.sgstAmount) || 0 + parseFloat(curr.igstAmount) || 0), 0);
        const grandTotalRaw = subtotal + gstTotal;
        const grandTotal = Math.round(grandTotalRaw);
        const roundOff = (grandTotal - grandTotalRaw).toFixed(2);

        setTotals({
            subtotal: parseFloat(subtotal.toFixed(2)),
            gstTotal: parseFloat(gstTotal.toFixed(2)),
            roundOff: parseFloat(roundOff),
            grandTotal: grandTotal
        });
    }, [items]);

    const handleAddItem = () => {
        setItems([...items, {
            id: Date.now(),
            productCode: '',
            productName: '',
            hsnCode: '',
            description: '',
            qty: 1,
            price: 0,
            scale: '',
            discountPercent: 0,
            gstPercent: 0,
            taxableAmount: 0,
            cgstAmount: 0,
            sgstAmount: 0,
            igstAmount: 0,
            amount: 0,
            totalAmount: 0
        }]);
    };

    const handleRemoveItem = (id) => {
        if (items.length > 1) {
            setItems(items.filter(item => item.id !== id));
        }
    };

    const fetchProductDetails = async (index, code) => {
        if (!code) return;
        try {
            const response = await api.get(`/stocks/code/${code}`);
            const product = response.data;
            if (product) {
                setItems(prev => prev.map((item, i) =>
                    i === index ? calculateItem({
                        ...item,
                        productCode: product.product_code,
                        productName: product.product_name,
                        hsnCode: product.hsn_code || '',
                        description: product.detail || '',
                        price: product.sale_price || 0,
                        scale: product.scale || '',
                        gstPercent: product.gst || 0
                    }, gstMode) : item
                ));
            }
        } catch (error) {
            console.error('Error fetching product details:', error);
        }
    };

    const handleItemChange = (index, field, value) => {
        setItems(prev => prev.map((item, i) => {
            if (i === index) {
                const updated = { ...item, [field]: value ?? '' };
                return calculateItem(updated, gstMode);
            }
            return item;
        }));
    };

    const handleCustomerNameChange = (e) => {
        const value = e.target.value;
        setCustomer({ ...customer, name: value });

        if (value.trim()) {
            const filtered = customerList.filter(c =>
                c.customer_name.toLowerCase().includes(value.toLowerCase()) ||
                c.customer_id.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const handleSelectCustomer = (selectedCust) => {
        setCustomer({
            id: selectedCust.customer_id,
            name: selectedCust.customer_name,
            gstNo: selectedCust.gst_no || '',
            address: selectedCust.customer_address || '',
            mobile: selectedCust.customer_mobile || '',
            contact: selectedCust.customer_contact || '',
            state: selectedCust.state || '',
            stateCode: selectedCust.state_code || ''
        });
        setShowSuggestions(false);
    };

    const handleImportQuotation = async (qNo) => {
        const targetQNo = qNo || importQuotationNo;
        if (!targetQNo.trim()) {
            showToast('warning', 'Please enter a quotation number');
            return;
        }

        try {
            setLoading(true);
            const response = await api.get(`/quotations/no/${targetQNo}`);
            const q = response.data;

            setCustomer({
                id: q.customer_id,
                name: q.customer_name,
                gstNo: q.gst_no || '',
                address: q.address || '',
                mobile: q.mobile_no || '',
                contact: q.contact_number || '',
                state: q.state || '',
                stateCode: q.state_code || ''
            });

            setGstMode(q.gst_mode || 'CGST_SGST');

            const formattedItems = q.items.map(item => ({
                id: Date.now() + Math.random(),
                productCode: item.product_code,
                productName: item.product_name,
                hsnCode: item.hsn_code,
                description: item.description,
                qty: item.qty,
                price: item.price,
                scale: item.scale || '',
                discountPercent: item.discount_percent,
                gstPercent: item.gst_percent,
                taxableAmount: item.taxable_amount,
                cgstAmount: item.cgst_amount,
                sgstAmount: item.sgst_amount,
                igstAmount: item.igst_amount,
                amount: (item.qty * item.price).toFixed(2),
                totalAmount: item.total_amount
            }));

            setItems(formattedItems);
            setImportQuotationNo(targetQNo);
            setShowQuotationSuggestions(false);
            showToast('success', 'Quotation imported successfully');
        } catch (error) {
            showToast('error', error.response?.data?.message || 'Quotation not found');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!customer.name) {
            showToast('warning', 'Please enter customer name');
            return;
        }

        confirmToast(
            'Are you sure you want to Save & Print this Invoice?',
            async () => {
                setLoading(true);
                try {
                    const payload = {
                        invoice_no: invoiceNo,
                        invoice_date: invoiceDate,
                        customer_id: customer.id,
                        customer_name: customer.name,
                        gst_no: customer.gstNo,
                        address: customer.address,
                        mobile_no: customer.mobile,
                        customer_contact: customer.contact,
                        state: customer.state,
                        state_code: customer.stateCode,
                        subtotal: totals.subtotal,
                        gst_total: totals.gstTotal,
                        round_off: totals.roundOff,
                        grand_total: totals.grandTotal,
                        gst_mode: gstMode,
                        items: items.map(item => ({
                            product_code: item.productCode,
                            product_name: item.productName,
                            hsn_code: item.hsnCode,
                            description: item.description,
                            qty: item.qty,
                            price: item.price,
                            discount_percent: item.discountPercent,
                            taxable_amount: item.taxableAmount,
                            gst_percent: item.gstPercent,
                            cgst_amount: item.cgstAmount,
                            sgst_amount: item.sgstAmount,
                            igst_amount: item.igstAmount,
                            total_amount: item.totalAmount
                        })),
                        credit: isCredit ? 'yes' : 'no'
                    };

                    await api.post('/invoices', payload);
                    showToast('success', 'Invoice saved successfully');

                    // Trigger Print
                    setTimeout(() => {
                        window.print();
                        handleReset();
                        fetchInvoices();
                        fetchCustomerList();
                    }, 500);
                } catch (error) {
                    showToast('error', error.response?.data?.message || 'Error saving invoice');
                } finally {
                    setLoading(false);
                }
            },
            'Save & Print'
        );
    };

    const handlePrintHistory = async (inv) => {
        try {
            setLoading(true);
            const response = await api.get(`/invoices/${inv.invoice_no}`);
            const data = response.data;

            setInvoiceNo(data.invoice_no);
            setInvoiceDate(data.invoice_date);
            setCustomer({
                id: data.customer_id,
                name: data.customer_name,
                gstNo: data.gst_no,
                address: data.address,
                mobile: data.mobile_no,
                contact: data.customer_contact,
                state: data.state,
                stateCode: data.state_code
            });
            setGstMode(data.gst_mode || 'CGST_SGST');

            const formattedItems = data.items.map(item => ({
                id: Date.now() + Math.random(),
                productCode: item.product_code,
                productName: item.product_name,
                hsnCode: item.hsn_code,
                description: item.description,
                qty: item.qty,
                price: item.price,
                discountPercent: item.discount_percent,
                taxableAmount: item.taxable_amount,
                gstPercent: item.gst_percent,
                cgstAmount: item.cgst_amount,
                sgstAmount: item.sgst_amount,
                igstAmount: item.igst_amount,
                totalAmount: item.total_amount
            }));
            setItems(formattedItems);

            // Small delay to ensure state updates components
            setTimeout(() => {
                window.print();
                handleReset();
            }, 500);

        } catch (error) {
            showToast('error', 'Failed to fetch invoice details');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        fetchNextNo();
        fetchNextCustomerId();
        setCustomer({
            id: '',
            name: '',
            gstNo: '',
            address: '',
            mobile: '',
            contact: '',
            state: '',
            stateCode: ''
        });
        setItems([{
            id: Date.now(),
            productCode: '',
            productName: '',
            hsnCode: '',
            description: '',
            qty: 1,
            price: 0,
            scale: '',
            discountPercent: 0,
            gstPercent: 0,
            taxableAmount: 0,
            cgstAmount: 0,
            sgstAmount: 0,
            igstAmount: 0,
            amount: 0,
            totalAmount: 0
        }]);
        setGstMode('CGST_SGST');
        setIsCredit(false);
        setShowSuggestions(false);
        setFilteredSuggestions([]);
        setImportQuotationNo('');
    };

    const filteredInvoices = invoices.filter(i =>
        (i.invoice_no || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (i.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (i.product_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        { key: 'invoice_no', label: 'Invoice No', className: 'whitespace-nowrap font-bold text-slate-600' },
        { key: 'invoice_date', label: 'Date', render: (val) => <span className="whitespace-nowrap font-bold text-slate-600">{new Date(val).toLocaleDateString()}</span> },
        { key: 'customer_name', label: 'Customer', className: 'whitespace-nowrap font-bold text-slate-600' },
        { key: 'contact_number', label: 'Mobile', className: 'whitespace-nowrap font-bold text-slate-600' },
        { key: 'gst_no', label: 'GST No', className: 'whitespace-nowrap font-bold text-slate-600' },
        { key: 'credit', label: 'Credit', render: (val) => <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${val === 'yes' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>{val || 'no'}</span> },
        { key: 'grand_total', label: 'Grand Total', render: (val) => <span className="font-black text-primary-700">₹{parseFloat(val || 0).toLocaleString()}</span> },
        { key: 'product_name', label: 'Product', className: 'whitespace-nowrap font-bold text-slate-600' },
        { key: 'description', label: 'Description', className: 'whitespace-nowrap font-bold text-slate-600' },
        { key: 'hsn_code', label: 'HSN', className: 'whitespace-nowrap font-bold text-slate-600' },
        { key: 'qty', label: 'Qty', className: 'whitespace-nowrap font-bold text-slate-600' },
        { key: 'price', label: 'Price', className: 'whitespace-nowrap font-bold text-slate-600', render: (val) => `₹${parseFloat(val || 0).toLocaleString()}` },
        { key: 'discount_percent', label: 'Discount', className: 'whitespace-nowrap font-bold text-slate-600', render: (val) => `${val || 0}%` },
        { key: 'taxable_amount', label: 'Taxable', className: 'whitespace-nowrap font-bold text-slate-600', render: (val) => `₹${parseFloat(val || 0).toLocaleString()}` },
        { key: 'gst_percent', label: 'GST', className: 'whitespace-nowrap font-bold text-slate-600', render: (val) => `${val || 0}%` },
        { key: 'item_total_amount', label: 'Item Total', className: 'whitespace-nowrap font-bold text-slate-600', render: (val) => <span className="font-black text-slate-900">₹{parseFloat(val || 0).toLocaleString()}</span> }
    ];

    if (loading && invoices.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="page-container bg-slate-50/50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-10">
                {/* Header Area */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-1">
                        <h1 className="section-title text-2xl font-bold text-slate-800">Invoice Entry</h1>
                        <p className="text-slate-500 text-base font-medium">Create and manage your professional billing invoices with enterprise precision.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowTable(!showTable)}
                            className={`flex items-center gap-2 px-8 py-3.5 rounded-[1.25rem] font-black transition-all duration-300 shadow-sm border uppercase text-xs tracking-widest
                            ${showTable
                                    ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                                    : 'bg-white text-primary-600 border-primary-200 hover:border-primary-400 hover:bg-primary-50 hover:shadow-md'}`}
                        >
                            {showTable ? <><ChevronUp size={18} /> Hide Records</> : <><ChevronDown size={18} /> View Invoices</>}
                        </button>
                    </div>
                </div>

                {showTable ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-200/60 overflow-hidden">
                            <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
                                    Invoice Records
                                    <span className="px-4 py-1.5 bg-primary-100 text-primary-700 text-[10px] font-black rounded-full uppercase tracking-widest leading-none">{invoices.length} RECORDS</span>
                                </h2>
                                <div className="relative w-full md:w-[450px]">
                                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search by invoice no or customer..."
                                        className="w-full pl-14 pr-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all font-bold text-slate-800"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <DataTable
                                columns={columns}
                                data={filteredInvoices}
                                actions={(item) => (
                                    <button
                                        onClick={() => handlePrintHistory(item)}
                                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                                        title="Print Invoice"
                                    >
                                        <Printer size={18} />
                                    </button>
                                )}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {/* Quotation Import & Bill Header */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Import Card */}
                            <div className="bg-white rounded-[2rem] shadow-premium border border-slate-100 overflow-hidden transition-all hover:shadow-2xl hover:shadow-primary-500/5">
                                <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
                                    <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                                        <Download size={20} />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900">Import Quotation</h3>
                                </div>
                                <div className="p-8 space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest flex items-center gap-1.5">
                                            <Hash size={12} className="text-primary-500" /> Quotation Number</label>
                                        <div className="space-y-2">
                                            <input
                                                type="text"
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm font-bold placeholder:font-normal"
                                                placeholder="QTN-XXXX"
                                                value={importQuotationNo}
                                                onChange={(e) => {
                                                    const val = e.target.value.toUpperCase();
                                                    setImportQuotationNo(val);
                                                    if (val.trim()) {
                                                        const filtered = quotationList.filter(q =>
                                                            q.quotation_no.toUpperCase().includes(val) ||
                                                            q.customer_name.toUpperCase().includes(val)
                                                        ).slice(0, 5);
                                                        setQuotationSuggestions(filtered);
                                                        const rect = e.target.getBoundingClientRect();
                                                        setImportDropdownPos({ top: rect.bottom + 4, left: rect.left });
                                                        setShowQuotationSuggestions(true);
                                                    } else {
                                                        setShowQuotationSuggestions(false);
                                                    }
                                                }}
                                                onBlur={() => setTimeout(() => setShowQuotationSuggestions(false), 200)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleImportQuotation()}
                                            />

                                            {showQuotationSuggestions && quotationSuggestions.length > 0 && (
                                                <div
                                                    style={{
                                                        position: 'fixed',
                                                        top: importDropdownPos.top,
                                                        left: importDropdownPos.left,
                                                        width: '300px',
                                                        zIndex: 9999
                                                    }}
                                                    className="bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                                                >
                                                    {quotationSuggestions.map((q) => (
                                                        <button
                                                            key={q.id}
                                                            onMouseDown={() => handleImportQuotation(q.quotation_no)}
                                                            className="w-full px-4 py-3 text-left hover:bg-primary-50 border-b border-slate-50 last:border-0 transition-colors group"
                                                        >
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <p className="text-xs font-black text-primary-600 font-mono tracking-tighter uppercase">{q.quotation_no}</p>
                                                                    <p className="text-[10px] font-bold text-slate-800 uppercase mt-0.5">{q.customer_name}</p>
                                                                </div>
                                                                <span className="text-[10px] font-black text-slate-400 group-hover:text-primary-500">{new Date(q.quotation_date).toLocaleDateString()}</span>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                            <button
                                                onClick={handleImportQuotation}
                                                disabled={loading || !canEdit(moduleId)}
                                                className={`w-full py-2.5 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-700 transition-all disabled:opacity-50 shadow-lg flex items-center justify-center gap-2 ${!canEdit(moduleId) ? 'shadow-none grayscale cursor-not-allowed' : 'shadow-primary-500/20'}`}
                                            >
                                                <Download size={16} />
                                                Fetch Quotation
                                            </button>
                                        </div>
                                        <p className="text-[12px] text-slate-400 mt-2 font-medium">Entering valid quotation no will autofill all details.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Invoice Header Details */}
                            <div className="lg:col-span-2 bg-white rounded-[2rem] shadow-premium border border-slate-100 overflow-hidden">
                                <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
                                    <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                                        <FileText size={20} />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900">Invoice Details</h3>
                                </div>
                                <div className="p-8">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest flex items-center gap-1.5"><Hash size={12} className="text-primary-500" /> Invoice Number</label>
                                            <div className="relative">
                                                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                                <input
                                                    type="text"
                                                    readOnly
                                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-primary-600"
                                                    value={invoiceNo}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="block text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                                <Calendar size={14} className="text-primary-500" /> Posting Date
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="date"
                                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none text-sm font-bold text-slate-800"
                                                    value={invoiceDate}
                                                    onChange={(e) => setInvoiceDate(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="block text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                                <Percent size={14} className="text-primary-500" /> GST
                                            </label>
                                            <div className="relative">
                                                <select
                                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none text-sm font-bold text-slate-800 appearance-none cursor-pointer"
                                                    value={gstMode}
                                                    onChange={(e) => {
                                                        const newMode = e.target.value;
                                                        setGstMode(newMode);
                                                        setItems(prev => prev.map(item => calculateItem(item, newMode)));
                                                    }}
                                                >
                                                    <option value="CGST_SGST">CGST + SGST (Local)</option>
                                                    <option value="IGST">IGST (Inter-State)</option>
                                                </select>
                                                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                                    <ChevronDown size={18} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Customer Info Section */}
                        <div className="bg-white rounded-[2rem] shadow-premium border border-slate-100 overflow-hidden relative group">
                            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                                        <User size={20} />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900">Customer Information</h3>
                                </div>
                                <div className="flex items-center gap-3 bg-primary-100/50 px-4 py-2 mr-8 rounded-xl border border-primary-200 cursor-pointer select-none transition-all hover:bg-primary-100" onClick={() => setIsCredit(!isCredit)}>
                                    <input
                                        type="checkbox"
                                        id="credit-checkbox"
                                        checked={isCredit}
                                        onChange={(e) => setIsCredit(e.target.checked)}
                                        className="w-4 h-4 text-primary-600 border-primary-300 rounded focus:ring-primary-500 cursor-pointer"
                                    />
                                    <label htmlFor="credit-checkbox" className="text-xs font-black text-primary-700 uppercase tracking-widest cursor-pointer">Mark as Credit</label>
                                </div>
                            </div>
                            <div className="p-8">

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <div className="md:col-span-2 relative space-y-3">
                                        <label className="block text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                            <User size={14} className="text-primary-500" /> Client Name
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none text-sm font-bold text-slate-800 placeholder:font-normal"
                                                placeholder="Search or enter customer name"
                                                value={customer.name}
                                                onChange={handleCustomerNameChange}
                                                onFocus={() => {
                                                    if (customer.name.trim()) setShowSuggestions(true);
                                                }}
                                            />
                                            {showSuggestions && filteredSuggestions.length > 0 && (
                                                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                                                    {filteredSuggestions.map((cust) => (
                                                        <button
                                                            key={cust.id}
                                                            type="button"
                                                            className="w-full px-4 py-3 text-left hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors"
                                                            onClick={() => handleSelectCustomer(cust)}
                                                        >
                                                            <div className="flex justify-between items-center">
                                                                <div>
                                                                    <p className="text-sm font-bold text-slate-800">{cust.customer_name}</p>
                                                                    <p className="text-[10px] font-bold text-primary-600 tracking-wider font-mono">{cust.customer_id}</p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-[10px] font-bold text-slate-400">{cust.customer_mobile}</p>
                                                                    <p className="text-[10px] font-bold text-slate-400">{cust.state || 'N/A'}</p>
                                                                </div>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                            {/* Click outside to close */}
                                            {showSuggestions && (
                                                <div
                                                    className="fixed inset-0 z-40"
                                                    onClick={() => setShowSuggestions(false)}
                                                />
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="block text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                            <Phone size={14} className="text-primary-500" /> Primary Mobile
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none text-sm font-bold text-slate-800"
                                            placeholder="Mobile"
                                            value={customer.mobile}
                                            maxLength={10}
                                            onChange={(e) => setCustomer({ ...customer, mobile: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="block text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                            <MapPin size={14} className="text-primary-500" /> Optional Number
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none text-sm font-bold text-slate-800"
                                            placeholder="Optional Number"
                                            value={customer.contact}
                                            maxLength={10}
                                            onChange={(e) => setCustomer({ ...customer, contact: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="block text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                            <FileText size={14} className="text-primary-500" /> Tax Identifier (GST)
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none text-sm font-bold text-slate-800 uppercase"
                                            placeholder="Optional"
                                            value={customer.gstNo}
                                            onChange={(e) => setCustomer({ ...customer, gstNo: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="block text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                            <MapPin size={14} className="text-primary-500" /> State Name
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none text-sm font-bold text-slate-800"
                                            placeholder="State"
                                            value={customer.state}
                                            onChange={(e) => setCustomer({ ...customer, state: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="block text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                            <Hash size={14} className="text-primary-500" /> State Code
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none text-sm font-bold text-slate-800"
                                            placeholder="Code"
                                            value={customer.stateCode}
                                            onChange={(e) => setCustomer({ ...customer, stateCode: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="block text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                            <MapPin size={14} className="text-primary-500" /> Address
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none text-sm font-bold text-slate-800"
                                            placeholder="Address"
                                            value={customer.address}
                                            onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Product Items Table */}
                        <div className="bg-white rounded-[2rem] shadow-premium border border-slate-100 overflow-hidden">
                            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                                        <Plus size={20} />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 text-slate-800 uppercase tracking-tighter">Product Items</h3>
                                </div>
                                <button
                                    onClick={handleAddItem}
                                    className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 flex items-center gap-2"
                                >
                                    <Plus size={14} /> Add Product
                                </button>
                            </div>

                            <div className="overflow-x-auto overflow-y-visible p-4 custom-scrollbar">
                                <table className="w-full min-w-[1500px] border-collapse table-fixed">
                                    <thead>
                                        <tr className="border-b border-slate-100">
                                            <th className="px-2 py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest w-[50px]">S.No</th>
                                            <th className="px-2 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest w-[180px]">Code</th>
                                            <th className="px-2 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest w-[300px]">Product Info</th>
                                            <th className="px-2 py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest w-[120px]">HSN</th>
                                            <th className="px-2 py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest w-[130px]">Qty</th>
                                            <th className="px-2 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest w-[140px]">Price</th>
                                            <th className="px-2 py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest w-[100px]">Disc%</th>
                                            <th className="px-2 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest w-[150px]">Taxable</th>
                                            <th className="px-2 py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest w-[100px]">GST%</th>
                                            <th className="px-2 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest w-[150px]">Total</th>
                                            <th className="px-2 py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest w-[80px]">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item, index) => (
                                            <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors duration-200">
                                                <td className="px-4 py-2 text-center">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 mx-auto">
                                                        {index + 1}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2">
                                                    <AutoResizeInput
                                                        value={item.productCode}
                                                        onChange={(e) => {
                                                            handleItemChange(index, 'productCode', e.target.value.toUpperCase());
                                                            const term = e.target.value.trim().toUpperCase();
                                                            if (!term) { setProductSuggestions(p => ({ ...p, [index]: [] })); setActiveProductIndex(null); return; }
                                                            const rect = e.target.getBoundingClientRect();
                                                            setDropdownPos({ top: rect.bottom + 4, left: rect.left });
                                                            setProductSuggestions(p => ({ ...p, [index]: stockList.filter(s => s.product_code?.toUpperCase().includes(term) || s.product_name?.toUpperCase().includes(term)).slice(0, 8) }));
                                                            setActiveProductIndex(index);
                                                        }}
                                                        onBlur={(e) => {
                                                            setTimeout(() => { setProductSuggestions(p => ({ ...p, [index]: [] })); setActiveProductIndex(null); }, 200);
                                                            fetchProductDetails(index, e.target.value);
                                                        }}
                                                        placeholder="CODE"
                                                        className="w-full uppercase"
                                                    />
                                                    {activeProductIndex === index && productSuggestions[index]?.length > 0 && (
                                                        <div
                                                            style={{ position: 'fixed', top: dropdownPos.top, left: dropdownPos.left, zIndex: 9999, width: '18rem' }}
                                                            className="bg-white border border-slate-200 rounded-xl shadow-xl max-h-56 overflow-y-auto"
                                                        >
                                                            {productSuggestions[index].map(prod => (
                                                                <button
                                                                    key={prod.product_code}
                                                                    type="button"
                                                                    className="w-full px-4 py-2.5 text-left hover:bg-primary-50 border-b border-slate-50 last:border-0 transition-colors"
                                                                    onMouseDown={() => {
                                                                        const ni = [...items];
                                                                        ni[index] = calculateItem({
                                                                            ...ni[index],
                                                                            productCode: prod.product_code || '',
                                                                            productName: prod.product_name || '',
                                                                            hsnCode: prod.hsn_code || '',
                                                                            description: prod.detail || '',
                                                                            price: prod.sale_price || 0,
                                                                            scale: prod.scale || '',
                                                                            gstPercent: prod.gst || 0
                                                                        }, gstMode);
                                                                        setItems(ni);
                                                                        setProductSuggestions(p => ({ ...p, [index]: [] }));
                                                                        setActiveProductIndex(null);
                                                                    }}
                                                                >
                                                                    <div className="flex justify-between items-center gap-2">
                                                                        <div>
                                                                            <p className="text-xs font-black text-slate-800 uppercase">{prod.product_name}</p>
                                                                            <p className="text-[10px] font-bold text-primary-600 font-mono">{prod.product_code}</p>
                                                                        </div>
                                                                        <span className="text-xs font-black text-slate-500 whitespace-nowrap">₹{prod.sale_price}</span>
                                                                    </div>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-2">
                                                    <AutoResizeInput
                                                        value={item.productName}
                                                        onChange={(e) => handleItemChange(index, 'productName', e.target.value)}
                                                        placeholder="ENTER PRODUCT NAME"
                                                        className="w-full uppercase"
                                                    />
                                                    <AutoResizeInput
                                                        value={item.description}
                                                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                        placeholder="DESCRIPTION"
                                                        className="w-full text-[10px] mt-1 text-slate-500 font-normal border-dashed"
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <AutoResizeInput
                                                        value={item.hsnCode}
                                                        onChange={(e) => handleItemChange(index, 'hsnCode', e.target.value)}
                                                        placeholder="HSN"
                                                        className="w-full text-center"
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <AutoResizeInput
                                                        type="number"
                                                        value={item.qty}
                                                        onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                                                        className="w-full text-center"
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <AutoResizeInput
                                                        type="number"
                                                        value={item.price}
                                                        onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                                                        className="w-full text-right font-black"
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <AutoResizeInput
                                                        type="number"
                                                        value={item.discountPercent}
                                                        onChange={(e) => handleItemChange(index, 'discountPercent', e.target.value)}
                                                        className="w-full text-center"
                                                    />
                                                </td>
                                                <td className="px-4 py-2 text-right">
                                                    <div className="px-4 py-3 bg-slate-100/50 rounded-xl text-sm font-bold text-slate-600 w-full border border-slate-100 text-right">
                                                        ₹{parseFloat(item.taxableAmount).toLocaleString()}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2">
                                                    <AutoResizeInput
                                                        type="number"
                                                        value={item.gstPercent}
                                                        onChange={(e) => handleItemChange(index, 'gstPercent', e.target.value)}
                                                        className="w-full text-center"
                                                    />
                                                </td>
                                                <td className="px-4 py-2 text-right">
                                                    <div className="px-4 py-3 bg-primary-50/30 rounded-xl text-sm font-black text-primary-700 w-full border border-primary-100 text-right">
                                                        ₹{parseFloat(item.totalAmount).toLocaleString()}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2 text-center">
                                                    <button
                                                        onClick={() => handleRemoveItem(item.id)}
                                                        className="p-3 text-danger-400 hover:text-danger-600 hover:bg-danger-50 rounded-xl transition-all"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Totals Section */}
                            <div className="p-10 bg-slate-50 flex flex-col items-end gap-6 border-t border-slate-100">
                                <div className="w-full md:w-96 space-y-4">
                                    <div className="flex justify-between items-center px-4">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Subtotal</span>
                                        <span className="text-lg font-black text-slate-700">₹{totals.subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center px-4">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">GST Total</span>
                                        <span className="text-lg font-black text-slate-700">₹{totals.gstTotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center px-4">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Round Off</span>
                                        <span className={`text-sm font-black ${totals.roundOff >= 0 ? 'text-green-600' : 'text-danger-600'}`}>
                                            {totals.roundOff >= 0 ? '+' : ''}{totals.roundOff}
                                        </span>
                                    </div>
                                    <div className="h-px bg-slate-200 w-full my-2"></div>
                                    <div className="flex justify-between items-center px-6 py-5 bg-slate-900 rounded-[24px] shadow-2xl shadow-slate-900/10">
                                        <span className="text-sm font-black text-white uppercase tracking-widest">Grand Total</span>
                                        <span className="text-3xl font-black text-white tracking-tighter">₹{totals.grandTotal.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <button
                                        onClick={handleReset}
                                        className="px-8 py-4 bg-white text-slate-600 border border-slate-200 rounded-[20px] font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2"
                                    >
                                        <RotateCcw size={16} /> Reset
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={loading || !canEdit(moduleId)}
                                        className={`flex-1 md:flex-none px-12 py-5 bg-primary-600 text-white rounded-[24px] font-black text-sm uppercase tracking-[0.15em] hover:bg-primary-700 transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 ${!canEdit(moduleId) ? 'shadow-none grayscale cursor-not-allowed' : 'shadow-primary-500/30'}`}
                                    >
                                        {loading ? (
                                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                        ) : (
                                            <>
                                                <Save size={20} />
                                                {canEdit(moduleId) ? 'SAVE & PRINT INVOICE' : 'VIEW ONLY MODE'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Print Component hidden from UI */}
                <InvoicePrint
                    invoiceNo={invoiceNo}
                    invoiceDate={invoiceDate}
                    customer={customer}
                    items={items}
                    totals={totals}
                    gstMode={gstMode}
                />
            </div>
        </div>
    );
};

export default Invoice;
