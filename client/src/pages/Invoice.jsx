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
import api from '../utils/api';
import DataTable from '../components/DataTable';
import { useToast } from '../context/ToastContext';
import InvoicePrint from '../components/InvoicePrint';

const AutoResizeInput = ({ value, onChange, placeholder, type = 'text', prefix, suffix, className = '', ...props }) => {
    const getWidth = () => {
        // If className specifies a width (e.g. w-32), don't auto-resize
        if (className.includes('w-')) return undefined;

        const charCount = Math.max(value?.toString().length || 0, placeholder?.length || 1, 4);
        return `calc(${charCount}ch + ${prefix ? '2.5rem' : '1.5rem'} + ${suffix ? '2rem' : '0.5rem'})`;
    };

    return (
        <div className={`relative flex items-center bg-slate-50/80 border border-slate-200 rounded-xl transition-all hover:bg-white focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 group ${className}`} style={getWidth() ? { width: getWidth() } : {}}>
            {prefix && (
                <span className="pl-3 pr-2 text-slate-400 font-bold text-xs select-none">
                    {prefix}
                </span>
            )}
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full bg-transparent px-2 py-2.5 text-sm font-bold text-slate-700 outline-none placeholder:text-slate-300 transition-all placeholder:font-normal"
                {...props}
            />
            {suffix && (
                <span className="pr-3 pl-1 text-slate-300 font-bold text-[10px] select-none uppercase tracking-tighter">
                    {suffix}
                </span>
            )}
        </div>
    );
};

const Invoice = () => {
    const { showToast, confirmToast } = useToast();
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
            const response = await api.get('/invoices');
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

    // Calculate item values
    useEffect(() => {
        const newItems = items.map(item => {
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

            if (gstMode === 'CGST_SGST') {
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
        });

        const subtotal = newItems.reduce((acc, curr) => acc + parseFloat(curr.taxableAmount), 0);
        const gstTotal = newItems.reduce((acc, curr) => acc + (parseFloat(curr.cgstAmount) + parseFloat(curr.sgstAmount) + parseFloat(curr.igstAmount)), 0);
        const grandTotalRaw = subtotal + gstTotal;
        const grandTotal = Math.round(grandTotalRaw);
        const roundOff = (grandTotal - grandTotalRaw).toFixed(2);

        setTotals({
            subtotal: parseFloat(subtotal.toFixed(2)),
            gstTotal: parseFloat(gstTotal.toFixed(2)),
            roundOff: parseFloat(roundOff),
            grandTotal: grandTotal
        });
    }, [items, gstMode]);

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
            const response = await api.get(`/quotations/product/${code}`);
            if (response.data) {
                const newItems = [...items];
                newItems[index] = {
                    ...newItems[index],
                    productName: response.data.product_name || '',
                    hsnCode: response.data.hsn_code || '',
                    price: response.data.sale_price || response.data.sales_price || 0,
                    scale: response.data.scale || response.data.scale_unit || '',
                    gstPercent: response.data.gst || response.data.gst_percent || 0
                };
                setItems(newItems);
            }
        } catch (error) {
            console.error('Product not found');
        }
    };

    const handleItemChange = (index, field, value) => {
        setItems(prev => prev.map((item, i) =>
            i === index ? { ...item, [field]: value ?? '' } : item
        ));
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
                        }))
                    };

                    await api.post('/invoices', payload);
                    showToast('success', 'Invoice saved successfully');

                    // Trigger Print
                    setTimeout(() => {
                        window.print();
                    }, 500);

                    handleReset();
                    fetchInvoices();
                    fetchCustomerList();
                } catch (error) {
                    showToast('error', error.response?.data?.message || 'Error saving invoice');
                } finally {
                    setLoading(false);
                }
            },
            'Save & Print'
        );
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
        setShowSuggestions(false);
        setFilteredSuggestions([]);
        setImportQuotationNo('');
    };

    const filteredInvoices = invoices.filter(i =>
        i.invoice_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        { key: 'invoice_no', label: 'Invoice No' },
        { key: 'invoice_date', label: 'Date', render: (val) => new Date(val).toLocaleDateString() },
        { key: 'customer_name', label: 'Customer' },
        { key: 'grand_total', label: 'Total Amount', render: (val) => `₹${val.toLocaleString()}` }
    ];

    if (loading && invoices.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-10 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Area */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="section-title text-2xl font-bold text-slate-800">Invoice Hub</h1>
                        <p className="text-slate-500 text-base mt-2 font-medium">Create and manage your professional billing invoices.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowTable(!showTable)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-sm border
                            ${showTable
                                    ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                                    : 'bg-white text-primary-600 border-primary-100 hover:border-primary-300 hover:bg-primary-50'}`}
                        >
                            {showTable ? <><ChevronUp size={20} /> Hide Records</> : <><ChevronDown size={20} /> View Invoices</>}
                        </button>
                    </div>
                </div>

                {showTable ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-200/60 overflow-hidden">
                            <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
                                    Invoice Records
                                    <span className="px-3 py-1 bg-primary-50 text-primary-600 text-xs rounded-full">{invoices.length} TOTAL</span>
                                </h2>
                                <div className="relative w-full md:w-96">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search by invoice no or customer..."
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all font-medium text-sm"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <DataTable columns={columns} data={filteredInvoices} />
                        </div>
                    </div>
                ) : (
                    <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {/* Quotation Import & Bill Header */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Import Card */}
                            <div className="bg-white p-8 rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-200/60 transition-all hover:shadow-2xl hover:shadow-primary-500/5">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-primary-50 rounded-xl">
                                        <Download className="text-primary-600" size={20} />
                                    </div>
                                    <h3 className="font-bold text-slate-800">Import Quotation</h3>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-2 tracking-widest">Quotation Number</label>
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
                                                disabled={loading}
                                                className="w-full py-2.5 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-700 transition-all disabled:opacity-50 shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2"
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
                            <div className="lg:col-span-2 bg-white p-8 rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-200/60">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-blue-50 rounded-xl">
                                        <FileText className="text-blue-600" size={20} />
                                    </div>
                                    <h3 className="font-bold text-slate-800">Invoice Details</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest flex items-center gap-1.5"><Hash size={12} /> Invoice Number</label>
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
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest flex items-center gap-1.5"><Calendar size={12} /> Invoice Date</label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none text-sm font-bold"
                                                value={invoiceDate}
                                                onChange={(e) => setInvoiceDate(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest flex items-center gap-1.5"><Percent size={12} /> GST Scheme</label>
                                        <select
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none text-sm font-bold appearance-none cursor-pointer"
                                            value={gstMode}
                                            onChange={(e) => setGstMode(e.target.value)}
                                        >
                                            <option value="CGST_SGST">CGST + SGST (Local)</option>
                                            <option value="IGST">IGST (Inter-State)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Customer Info Section */}
                        <div className="bg-white p-8 rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-200/60 overflow-hidden relative group">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="font-bold text-slate-800 flex items-center gap-3">
                                    <div className="p-2 bg-slate-100 rounded-xl">
                                        <User className="text-slate-600" size={20} />
                                    </div>
                                    Customer Information
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="md:col-span-2 relative">
                                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest flex items-center gap-1.5"><User size={12} /> Customer Name</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm font-bold"
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
                                        {showSuggestions && (
                                            <div
                                                className="fixed inset-0 z-40"
                                                onClick={() => setShowSuggestions(false)}
                                            />
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-2 flex items-center gap-1.5 uppercase tracking-widest">
                                        <Phone size={12} /> Mobile Number</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm font-bold"
                                        placeholder="Primary mobile"
                                        value={customer.mobile}
                                        onChange={(e) => setCustomer({ ...customer, mobile: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-2 flex items-center gap-1.5 uppercase tracking-widest">
                                        <MapPin size={12} /> Landline / Contact</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm font-bold"
                                        placeholder="Office contact"
                                        value={customer.contact}
                                        onChange={(e) => setCustomer({ ...customer, contact: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-2 flex items-center gap-1.5 uppercase tracking-widest">
                                        <FileText size={12} /> GST Registration No</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm font-bold uppercase"
                                        placeholder="Optional"
                                        value={customer.gstNo}
                                        onChange={(e) => setCustomer({ ...customer, gstNo: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-2 flex items-center gap-1.5 uppercase tracking-widest">
                                        <MapPin size={12} /> State / Region</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm font-bold"
                                        placeholder="State"
                                        value={customer.state}
                                        onChange={(e) => setCustomer({ ...customer, state: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase flex items-center gap-1.5 tracking-widest">
                                        <Hash size={12} /> State Code</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm font-bold"
                                        placeholder="Code"
                                        value={customer.stateCode}
                                        onChange={(e) => setCustomer({ ...customer, stateCode: e.target.value })}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 mb-2 flex items-center gap-1.5 uppercase tracking-widest">
                                        <MapPin size={12} /> Complete Address</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm font-bold"
                                        placeholder="Shipping/Billing address"
                                        value={customer.address}
                                        onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Product Items Table */}
                        <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-200/60 overflow-hidden">
                            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-3">
                                    <div className="p-2 bg-slate-100 rounded-xl">
                                        <Calculator className="text-slate-600" size={20} />
                                    </div>
                                    Billing Items
                                </h3>
                                <button
                                    onClick={handleAddItem}
                                    className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 flex items-center gap-2"
                                >
                                    <Plus size={14} /> Add Product
                                </button>
                            </div>

                            <div className="overflow-x-auto overflow-y-visible p-4 custom-scrollbar">
                                <table className="w-full min-w-[1600px] border-separate border-spacing-y-3">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-2 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest w-16">S.No</th>
                                            <th className="px-4 py-2 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest w-48">Code</th>
                                            <th className="px-4 py-2 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Info</th>
                                            <th className="px-4 py-2 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest w-32">HSN</th>
                                            <th className="px-4 py-2 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest w-40">Qty</th>
                                            <th className="px-4 py-2 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest w-44">Price</th>
                                            <th className="px-4 py-2 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest w-28">Disc%</th>
                                            <th className="px-4 py-2 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest w-44">Taxable</th>
                                            <th className="px-4 py-2 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest w-28">GST%</th>
                                            <th className="px-4 py-2 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest w-44">Total</th>
                                            <th className="px-4 py-2 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest w-16">Action</th>
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
                                                                        ni[index] = { ...ni[index], productCode: prod.product_code || '', productName: prod.product_name || '', hsnCode: prod.hsn_code || '', price: prod.sale_price || 0, scale: prod.scale || '', gstPercent: prod.gst || 0 };
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
                                                        suffix={item.scale || 'UNIT'}
                                                        className="w-full text-center"
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <AutoResizeInput
                                                        type="number"
                                                        value={item.price}
                                                        onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                                                        prefix="₹"
                                                        className="w-full text-right font-black"
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <AutoResizeInput
                                                        type="number"
                                                        value={item.discountPercent}
                                                        onChange={(e) => handleItemChange(index, 'discountPercent', e.target.value)}
                                                        suffix="%"
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
                                                        suffix="%"
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
                                        disabled={loading}
                                        className="flex-1 md:flex-none px-12 py-5 bg-primary-600 text-white rounded-[24px] font-black text-sm uppercase tracking-[0.15em] hover:bg-primary-700 transition-all shadow-xl shadow-primary-500/30 flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                        ) : (
                                            <>
                                                <Save size={20} />
                                                SAVE & PRINT INVOICE
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
