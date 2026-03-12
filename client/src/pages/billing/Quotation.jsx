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
    MapPin,
    Phone
} from 'lucide-react';
import api from '../../utils/api';
import DataTable from '../../components/DataTable';
import { useToast } from '../../context/ToastContext';
import { usePermissions } from '../../hooks/usePermissions';
import QuotationPrint from '../../components/reports/QuotationPrint';
import {
    Edit2,
    ChevronDown,
    ChevronUp,
    AlertCircle
} from 'lucide-react';

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

const Quotation = () => {
    const { showToast, confirmToast } = useToast();
    const { canEdit } = usePermissions();
    const moduleId = 'quotation';
    const [loading, setLoading] = useState(false);
    const [quotations, setQuotations] = useState([]);
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

    // Header State
    const [quotationNo, setQuotationNo] = useState('');
    const [quotationDate, setQuotationDate] = useState(new Date().toISOString().split('T')[0]);

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

    // Totals State
    const [totals, setTotals] = useState({
        subtotal: 0,
        gstTotal: 0,
        roundOff: 0,
        grandTotal: 0
    });

    const [gstMode, setGstMode] = useState('CGST_SGST'); // 'CGST_SGST' or 'IGST'

    // Fetch Next Quotation Number
    const fetchNextNo = async () => {
        try {
            const response = await api.get('/quotations/next-no');
            setQuotationNo(response.data.nextNo);
        } catch (error) {
            showToast('error', 'Error fetching quotation number');
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

    const fetchQuotations = async () => {
        setLoading(true);
        try {
            const response = await api.get('/quotations');
            setQuotations(response.data);
        } catch (error) {
            showToast('error', 'Failed to fetch quotation records');
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

    useEffect(() => {
        fetchNextNo();
        fetchQuotations();
        fetchCustomerList();
        fetchNextCustomerId();
    }, []);

    const fetchStockList = async () => {
        try {
            const res = await api.get('/stocks');
            setStockList(res.data);
        } catch (e) { console.error('stock list', e); }
    };

    useEffect(() => { fetchStockList(); }, []);

    // Calculate item values
    const calculateItem = useCallback((item, mode) => {
        const qty = parseFloat(item.qty) || 0;
        const price = parseFloat(item.price) || 0;
        const discountPercent = parseFloat(item.discountPercent) || 0;
        const gstPercent = parseFloat(item.gstPercent) || 0;

        const baseAmount = qty * price;
        const discountAmount = (baseAmount * discountPercent) / 100;
        const taxableAmount = baseAmount - discountAmount;

        const gstAmount = (taxableAmount * gstPercent) / 100;

        let cgst = 0, sgst = 0, igst = 0;
        if (mode === 'CGST_SGST') {
            cgst = gstAmount / 2;
            sgst = gstAmount / 2;
        } else {
            igst = gstAmount;
        }

        return {
            ...item,
            taxableAmount: parseFloat(taxableAmount.toFixed(2)),
            cgstAmount: parseFloat(cgst.toFixed(2)),
            sgstAmount: parseFloat(sgst.toFixed(2)),
            igstAmount: parseFloat(igst.toFixed(2)),
            amount: parseFloat(taxableAmount.toFixed(2)),
            totalAmount: parseFloat((taxableAmount + gstAmount).toFixed(2))
        };
    }, []);

    // Update totals whenever items or mode changes
    useEffect(() => {
        const newItems = items.map(item => calculateItem(item, gstMode));

        let subtotal = 0;
        let gstTotal = 0;

        newItems.forEach(item => {
            subtotal += item.taxableAmount;
            gstTotal += (item.cgstAmount + item.sgstAmount + item.igstAmount);
        });

        const rawTotal = subtotal + gstTotal;
        const grandTotal = Math.round(rawTotal);
        const roundOff = parseFloat((grandTotal - rawTotal).toFixed(2));

        // Only update if items actually changed (to avoid infinite loop)
        const itemsChanged = JSON.stringify(newItems) !== JSON.stringify(items);
        if (itemsChanged) {
            setItems(newItems);
        }

        setTotals({
            subtotal: parseFloat(subtotal.toFixed(2)),
            gstTotal: parseFloat(gstTotal.toFixed(2)),
            roundOff,
            grandTotal
        });
    }, [items, gstMode, calculateItem]);

    const handleProductLookup = async (index, code) => {
        if (!code) return;
        try {
            const response = await api.get(`/quotations/product/${code}`);
            const product = response.data;

            const newItems = [...items];
            newItems[index] = {
                ...newItems[index],
                productCode: product.product_code,
                productName: product.product_name,
                hsnCode: product.hsn_code || '',
                description: product.detail || '',
                price: product.sale_price || 0,
                scale: product.scale || '',
                gstPercent: product.gst || 0,
                discountPercent: product.discount_percent || 0
            };
            setItems(newItems);
        } catch (error) {
            showToast('error', 'Product not found or error fetching details');
        }
    };

    const addItem = () => {
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

    const removeItem = (id) => {
        if (items.length > 1) {
            setItems(items.filter(item => item.id !== id));
        }
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
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

    const handleSave = async () => {
        if (!customer.name) {
            showToast('warning', 'Please enter customer name');
            return;
        }

        confirmToast(
            'Are you sure you want to Save & Print this Quotation?',
            async () => {
                setLoading(true);
                try {
                    const payload = {
                        quotation_no: quotationNo,
                        quotation_date: quotationDate,
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

                    await api.post('/quotations', payload);
                    showToast('success', 'Quotation saved successfully');

                    // Trigger Print
                    setTimeout(() => {
                        window.print();
                    }, 500);

                    handleReset();
                    fetchQuotations();
                    fetchCustomerList();
                } catch (error) {
                    showToast('error', error.response?.data?.message || 'Error saving quotation');
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
        fetchNextNo();
        setShowSuggestions(false);
        setFilteredSuggestions([]);
    };

    const filteredQuotations = quotations.filter(q =>
        q.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.quotation_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (q.mobile_no && q.mobile_no.includes(searchTerm))
    );

    return (
        <div className="page-container bg-slate-50/50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-10">
                {/* Header Area */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-1">
                        <h1 className="section-title text-2xl font-bold text-slate-800">Billing Quotation</h1>
                        <p className="text-slate-500 text-base font-medium">Create and manage professional quotations for your customers with absolute precision.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowTable(!showTable)}
                            className={`flex items-center gap-2 px-8 py-3.5 rounded-[1.25rem] font-black transition-all duration-300 shadow-sm border uppercase text-xs tracking-widest
                            ${showTable
                                    ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                                    : 'bg-white text-primary-600 border-primary-200 hover:border-primary-400 hover:bg-primary-50 hover:shadow-md'}`}
                        >
                            {showTable ? <><ChevronUp size={18} /> Hide Registry</> : <><ChevronDown size={18} /> View Registry</>}
                        </button>
                    </div>
                </div>

                {showTable && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                        <DataTable
                            columns={[
                                {
                                    key: 'serial',
                                    label: 'S.No',
                                    render: (value, row, index) => (
                                        <span className="text-xs font-bold text-slate-600">{index + 1}</span>
                                    )
                                },
                                {
                                    key: 'quotation_no',
                                    label: 'Quotation No',
                                    render: (value) => <span className="font-bold text-primary-600">{value}</span>
                                },
                                {
                                    key: 'quotation_date',
                                    label: 'Date',
                                    render: (value) => <span className="text-slate-600">{new Date(value).toLocaleDateString()}</span>
                                },
                                {
                                    key: 'customer_name',
                                    label: 'Customer Info',
                                    render: (value, q) => (
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900">{value}</span>
                                            <span className="text-xs text-slate-400">{q.mobile_no || 'No mobile'}</span>
                                        </div>
                                    )
                                },
                                {
                                    key: 'grand_total',
                                    label: 'Amount',
                                    className: 'text-right',
                                    render: (value) => <span className="font-bold text-slate-900">₹{parseFloat(value).toLocaleString()}</span>
                                },
                                {
                                    key: 'gst_mode',
                                    label: 'GST Mode',
                                    className: 'text-center',
                                    render: (value) => (
                                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${value === 'IGST' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                                            {value}
                                        </span>
                                    )
                                }
                            ]}
                            data={filteredQuotations}
                            loading={loading}
                            searchTerm={searchTerm}
                            onSearchChange={setSearchTerm}
                            searchPlaceholder="Search by customer or number..."
                            emptyMessage="No quotations found"
                        />
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                    {/* Left: Customer & Items */}
                    <div className="lg:col-span-3 space-y-8">

                        <div className="bg-white rounded-[2rem] shadow-premium border border-slate-200 overflow-hidden">
                            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
                                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                                    <User size={20} />
                                </div>
                                <h2 className="text-lg font-bold text-slate-900">Customer Details</h2>
                            </div>
                            <div className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <div className="space-y-3">
                                        <label className="block text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                            <Calendar size={14} className="text-primary-500" /> Date
                                        </label>
                                        <input
                                            type="date"
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none text-sm font-bold text-slate-800"
                                            value={quotationDate}
                                            onChange={(e) => setQuotationDate(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="block text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                            <Hash size={14} className="text-primary-500" /> Reference No
                                        </label>
                                        <input
                                            type="text"
                                            readOnly
                                            className="w-full px-5 py-3.5 bg-primary-50/50 border border-primary-100 rounded-2xl text-sm font-black text-primary-700 select-none shadow-sm"
                                            value={quotationNo}
                                        />
                                    </div>
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
                                            <Phone size={14} className="text-primary-500" /> Primary Contact
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none text-sm font-bold text-slate-800"
                                            placeholder="Mobile"
                                            value={customer.mobile}
                                            onChange={(e) => setCustomer({ ...customer, mobile: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="block text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                            <MapPin size={14} className="text-primary-500" /> Secondary Contact
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none text-sm font-bold text-slate-800"
                                            value={customer.contact}
                                            onChange={(e) => setCustomer({ ...customer, contact: e.target.value })}
                                            placeholder="Optional"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="block text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                            <FileText size={14} className="text-primary-500" /> Tax Identifier (GST)
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none text-sm font-bold text-slate-800 uppercase"
                                            value={customer.gstNo}
                                            onChange={(e) => setCustomer({ ...customer, gstNo: e.target.value })}
                                            placeholder="GSTIN"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="block text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                            <MapPin size={14} className="text-primary-500" /> Regional Domain
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none text-sm font-bold text-slate-800"
                                            value={customer.state}
                                            onChange={(e) => setCustomer({ ...customer, state: e.target.value })}
                                            placeholder="State"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="block text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                            <Hash size={14} className="text-primary-500" /> Zone Code
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none text-sm font-bold text-slate-800"
                                            value={customer.stateCode}
                                            onChange={(e) => setCustomer({ ...customer, stateCode: e.target.value })}
                                            placeholder="Code"
                                        />
                                    </div>
                                    <div className="md:col-span-3 space-y-3">
                                        <label className="block text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                            <MapPin size={14} className="text-primary-500" /> Geographic Location
                                        </label>
                                        <textarea
                                            rows="1"
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none text-sm font-bold text-slate-800 transition-all"
                                            placeholder="Full address"
                                            value={customer.address}
                                            onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-[2rem] shadow-premium border border-slate-200 overflow-hidden">
                            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                                        <Plus size={20} />
                                    </div>
                                    <h2 className="text-lg font-bold text-slate-900">Product Items</h2>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                                        <span className="text-xs font-bold text-slate-500">GST MODE:</span>
                                        <label className="flex items-center gap-1.5 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="gstMode"
                                                className="w-4 h-4 accent-primary-600"
                                                checked={gstMode === 'CGST_SGST'}
                                                onChange={() => setGstMode('CGST_SGST')}
                                            />
                                            <span className="text-xs font-bold text-slate-700">CGST/SGST</span>
                                        </label>
                                        <label className="flex items-center gap-1.5 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="gstMode"
                                                className="w-4 h-4 accent-primary-600"
                                                checked={gstMode === 'IGST'}
                                                onChange={() => setGstMode('IGST')}
                                            />
                                            <span className="text-xs font-bold text-slate-700">IGST</span>
                                        </label>
                                    </div>
                                    <button
                                        onClick={addItem}
                                        className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all"
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto pb-4 pt-4 custom-scrollbar bg-white 0 shadow-premium p-0">
                                <table className="w-full text-left border-collapse min-w-[1500px] table-fixed">
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
                                    <tbody className="divide-y divide-slate-100">
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
                                                            handleProductLookup(index, e.target.value);
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
                                                                        ni[index] = {
                                                                            ...ni[index],
                                                                            productCode: prod.product_code || '',
                                                                            productName: prod.product_name || '',
                                                                            hsnCode: prod.hsn_code || '',
                                                                            description: prod.detail || '',
                                                                            price: prod.sale_price || 0,
                                                                            scale: prod.scale || '',
                                                                            gstPercent: prod.gst || 0
                                                                        };
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
                                                <td className="px-4 py-2 text-center">
                                                    <AutoResizeInput
                                                        type="number"
                                                        value={item.discountPercent}
                                                        onChange={(e) => handleItemChange(index, 'discountPercent', e.target.value)}
                                                        className="w-full text-center"
                                                    />
                                                </td>
                                                <td className="px-4 py-2 text-right">
                                                    <div className="px-4 py-3 bg-slate-100/50 rounded-xl text-sm font-bold text-slate-600 w-full border border-slate-100 text-right">
                                                        ₹{item.taxableAmount.toLocaleString()}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2 text-center">
                                                    <AutoResizeInput
                                                        type="number"
                                                        value={item.gstPercent}
                                                        onChange={(e) => handleItemChange(index, 'gstPercent', e.target.value)}
                                                        className="w-full text-center"
                                                    />
                                                </td>
                                                <td className="px-4 py-2 text-right">
                                                    <div className="px-4 py-3 bg-primary-50/30 rounded-xl text-sm font-black text-primary-700 w-full border border-primary-100 text-right">
                                                        ₹{item.totalAmount.toLocaleString()}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2 text-center">
                                                    <button
                                                        onClick={() => removeItem(item.id)}
                                                        className="p-3 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right: Calculations & Actions */}
                    <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
                        {/* Summary Card */}
                        <div className="bg-slate-900 rounded-[2rem] shadow-premium p-8 text-white space-y-8">
                            <div className="flex items-center gap-4 pb-6 border-b border-slate-800">
                                <div className="w-10 h-10 bg-primary-500/10 rounded-xl flex items-center justify-center text-primary-400">
                                    <Calculator size={20} />
                                </div>
                                <h3 className="font-bold tracking-wider text-sm uppercase">Summary</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-slate-400">
                                    <span className="text-xs font-bold tracking-widest">SubTotal</span>
                                    <span className="font-bold">₹{totals.subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-slate-400">
                                    <span className="text-xs font-bold tracking-widest">GST Total ({gstMode})</span>
                                    <span className="font-bold">₹{totals.gstTotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-slate-400">
                                    <span className="text-xs font-bold tracking-widest">Round Off</span>
                                    <span className="font-bold">{totals.roundOff >= 0 ? '+' : ''}{totals.roundOff}</span>
                                </div>
                                <div className="pt-4 border-t border-slate-800">
                                    <div className="flex justify-between items-end">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-primary-400 uppercase tracking-[0.2em] mb-1">Grand Total</span>
                                            <div className="flex items-center gap-1">
                                                <IndianRupee size={24} className="text-primary-400" />
                                                <span className="text-4xl font-black">{totals.grandTotal.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 pt-4">
                                <button
                                    onClick={handleSave}
                                    disabled={loading || !canEdit(moduleId)}
                                    className={`w-full py-4 bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-500 hover:to-blue-500 text-white rounded-xl font-black tracking-widest text-sm transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-50 ${!canEdit(moduleId) ? 'shadow-none grayscale cursor-not-allowed' : 'shadow-primary-500/20'}`}
                                >
                                    {loading ? 'Processing...' : (
                                        <>
                                            <Printer size={20} />
                                            {canEdit(moduleId) ? 'Save & Print Quotation' : 'View Only Mode'}
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-[10px] tracking-widest transition-all flex items-center justify-center gap-2"
                                >
                                    <RotateCcw size={16} /> Reset Form
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Print Component */}
                <QuotationPrint
                    quotationDate={quotationDate}
                    quotationNo={quotationNo}
                    customer={customer}
                    items={items}
                    totals={totals}
                    gstMode={gstMode}
                />
            </div>
        </div>
    );
};

export default Quotation;
