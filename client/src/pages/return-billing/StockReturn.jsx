import React, { useState, useEffect } from 'react';
import {
    Search,
    Plus,
    Trash2,
    X,
    RotateCcw,
    Save,
    Printer,
    FileText,
    History,
    ChevronDown,
    ChevronUp,
    Hash,
    Tag,
    Calendar,
    Phone,
    User,
    CreditCard
} from 'lucide-react';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import DataTable from '../../components/DataTable';

const StockReturn = () => {
    const { showToast, confirmToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [returnNo, setReturnNo] = useState('');
    const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
    const [billNo, setBillNo] = useState('');
    const [returns, setReturns] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [historySearchTerm, setHistorySearchTerm] = useState('');
    // Autocomplete State
    const [invoiceList, setInvoiceList] = useState([]);
    const [billSuggestions, setBillSuggestions] = useState([]);
    const [showBillSuggestions, setShowBillSuggestions] = useState(false);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

    // Customer State
    const [customer, setCustomer] = useState({
        id: '',
        name: '',
        mobile: '',
        isCredit: false
    });

    // Items State
    const [items, setItems] = useState([]);

    const fetchNextReturnNo = async () => {
        try {
            const response = await api.get('/stock-returns/next-no');
            setReturnNo(response.data.nextNo);
        } catch (error) {
            console.error('Error fetching next return number');
        }
    };

    const fetchAllInvoices = async () => {
        try {
            const response = await api.get('/invoices');
            setInvoiceList(response.data);
        } catch (error) {
            console.error('Error fetching invoices');
        }
    };

    const fetchAllReturns = async () => {
        try {
            const response = await api.get('/stock-returns');
            setReturns(response.data);
        } catch (error) {
            console.error('Error fetching returns');
        }
    };

    useEffect(() => {
        fetchNextReturnNo();
        fetchAllReturns();
        fetchAllInvoices();
    }, []);

    const handleSearchBill = async (specificBillNo) => {
        const targetBillNo = specificBillNo || billNo;
        if (!targetBillNo) {
            showToast('warning', 'Please enter a Bill Number');
            return;
        }

        setLoading(true);
        try {
            const response = await api.get(`/invoices/${targetBillNo}`);
            const invoice = response.data;

            setCustomer({
                id: invoice.customer_id,
                name: invoice.customer_name,
                mobile: invoice.mobile_no,
                isCredit: invoice.gst_mode === 'IGST'
            });

            const invoiceItems = invoice.items.map(item => ({
                id: item.id,
                product_code: item.product_code,
                product_name: item.product_name,
                bill_date: invoice.invoice_date,
                discount_percent: item.discount_percent,
                qty_sold: item.qty,
                return_qty: 0,
                price: item.price,
                amount: 0
            }));

            setItems(invoiceItems);
            setBillNo(targetBillNo);
            setShowBillSuggestions(false);
            showToast('success', 'Bill details loaded');
        } catch (error) {
            showToast('error', 'Bill not found or error loading details');
        } finally {
            setLoading(false);
        }
    };

    const handleReturnQtyChange = (id, value) => {
        setItems(prev => prev.map(item => {
            if (item.id === id) {
                const rQty = parseFloat(value) || 0;
                if (rQty > item.qty_sold) {
                    showToast('warning', `Max return: ${item.qty_sold}`);
                    return { ...item, return_qty: item.qty_sold, amount: calculateItemAmount(item, item.qty_sold) };
                }
                return { ...item, return_qty: rQty, amount: calculateItemAmount(item, rQty) };
            }
            return item;
        }));
    };

    const calculateItemAmount = (item, qty) => {
        const discount = 1 - (parseFloat(item.discount_percent) / 100);
        return (parseFloat(item.price) * qty * discount).toFixed(2);
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0).toFixed(2);
    };

    const handleSave = async () => {
        const returnItems = items.filter(i => parseFloat(i.return_qty) > 0);
        if (returnItems.length === 0) {
            showToast('warning', 'Set return quantity for at least one item');
            return;
        }

        const payload = {
            return_no: returnNo,
            return_date: returnDate,
            bill_no: billNo,
            customer_id: customer.id,
            customer_name: customer.name,
            mobile_no: customer.mobile,
            is_credit: customer.isCredit,
            total_amount: calculateTotal(),
            items: returnItems.map(item => ({
                product_code: item.product_code,
                product_name: item.product_name,
                bill_date: item.bill_date.split('T')[0],
                discount_percent: item.discount_percent,
                return_qty: item.return_qty,
                amount: item.amount,
                stock_at_return: 0
            }))
        };

        setLoading(true);
        try {
            await api.post('/stock-returns', payload);
            showToast('success', 'Stock Return processed successfully');
            handleReset();
            fetchAllReturns();
        } catch (error) {
            showToast('error', error.response?.data?.message || 'Error saving return');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setBillNo('');
        setCustomer({ id: '', name: '', mobile: '', isCredit: false });
        setItems([]);
        fetchNextReturnNo();
    };

    const returnColumns = [
        {
            key: 'product_code',
            label: 'Product Code',
            render: (value) => <span className="font-bold text-slate-900 font-mono">{value}</span>
        },
        {
            key: 'bill_date',
            label: 'Bill Date',
            render: (value) => <span className="text-slate-500 font-medium">{value.split('T')[0]}</span>
        },
        {
            key: 'discount_percent',
            label: 'Disc%',
            className: 'text-right',
            render: (value) => <span className="text-slate-600 font-bold">{value}%</span>
        },
        {
            key: 'return_qty',
            label: 'Return Qty',
            className: 'text-center',
            render: (value, item) => (
                <div className="flex items-center justify-center gap-3">
                    <span className="text-[10px] font-black text-slate-300 uppercase">of {item.qty_sold}</span>
                    <input
                        type="number"
                        value={value}
                        onChange={(e) => handleReturnQtyChange(item.id, e.target.value)}
                        className="w-20 bg-primary-50 border-none rounded-xl py-1.5 px-3 text-right font-black text-primary-700 focus:ring-2 focus:ring-primary-500/20"
                    />
                </div>
            )
        },
        {
            key: 'product_name',
            label: 'Product Name',
            render: (value) => <span className="font-bold text-slate-900 uppercase">{value}</span>
        },
        {
            key: 'amount',
            label: 'Amount',
            className: 'text-right',
            render: (value) => <span className="font-black text-slate-900 whitespace-nowrap">₹{parseFloat(value).toLocaleString()}</span>
        }
    ];

    const historyColumns = [
        {
            key: 'return_no',
            label: 'Return No',
            render: (value) => <span className="font-black text-primary-600">{value}</span>
        },
        {
            key: 'return_date',
            label: 'Date',
            render: (value) => <span className="text-slate-500 font-bold">{new Date(value).toLocaleDateString()}</span>
        },
        {
            key: 'bill_no',
            label: 'Original Bill',
            render: (value) => <span className="text-slate-700 font-bold">{value}</span>
        },
        {
            key: 'customer_name',
            label: 'Customer',
            render: (value, row) => (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-900">{value}</span>
                    <span className="text-[10px] text-slate-400 font-black tracking-widest uppercase">{row.mobile_no}</span>
                </div>
            )
        },
        {
            key: 'total_amount',
            label: 'Total Refund',
            className: 'text-right',
            render: (value) => <span className="font-black text-slate-900">₹{parseFloat(value).toLocaleString()}</span>
        }
    ];

    return (
        <div className="page-container bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-10">
                {/* Header Area */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-1">
                        <h1 className="section-title text-2xl font-bold text-slate-800">Stock Return Port</h1>
                        <p className="text-slate-500 text-base font-medium">Process customer returns and restock items with absolute inventory precision.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            className={`flex items-center gap-2 px-8 py-3.5 rounded-[1.25rem] font-black transition-all duration-300 shadow-sm border uppercase text-xs tracking-widest
                            ${showHistory
                                    ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                                    : 'bg-white text-primary-600 border-primary-200 hover:border-primary-400 hover:bg-primary-50 hover:shadow-md'}`}
                        >
                            {showHistory ? <><ChevronUp size={18} /> Hide Registry</> : <><History size={18} /> Show Detail</>}
                        </button>
                    </div>
                </div>

                {/* Main Content Toggle */}
                {!showHistory ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Process Card */}
                            <div className="lg:col-span-2 card p-0 overflow-hidden">
                                <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
                                    <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                                        <RotateCcw size={20} />
                                    </div>
                                    <h2 className="text-lg font-bold text-slate-900">Process Return Entry</h2>
                                </div>

                                <div className="p-8">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                                        <div className="space-y-3">
                                            <label className="block text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                                <Calendar size={14} className="text-primary-500" /> Return Date
                                            </label>
                                            <input
                                                type="date"
                                                value={returnDate}
                                                onChange={(e) => setReturnDate(e.target.value)}
                                                className="input-field font-bold"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="block text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                                <FileText size={14} className="text-primary-500" /> Bill Reference
                                            </label>
                                            <div className="relative group">
                                                <input
                                                    type="text"
                                                    placeholder="INV-0001"
                                                    value={billNo}
                                                    onChange={(e) => {
                                                        const val = e.target.value.toUpperCase();
                                                        setBillNo(val);
                                                        if (val.trim()) {
                                                            const filtered = invoiceList.filter(inv =>
                                                                inv.invoice_no.toUpperCase().includes(val) ||
                                                                inv.customer_name.toUpperCase().includes(val)
                                                            ).slice(0, 5);
                                                            setBillSuggestions(filtered);
                                                            const rect = e.target.getBoundingClientRect();
                                                            setDropdownPos({ top: rect.bottom + 4, left: rect.left });
                                                            setShowBillSuggestions(true);
                                                        } else {
                                                            setShowBillSuggestions(false);
                                                        }
                                                    }}
                                                    onBlur={() => setTimeout(() => setShowBillSuggestions(false), 200)}
                                                    className="input-field font-black uppercase text-primary-600 pr-12"
                                                />
                                                <button
                                                    onClick={() => handleSearchBill()}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-primary-50 text-primary-600 rounded-lg transition-all"
                                                >
                                                    <Search size={18} />
                                                </button>

                                                {showBillSuggestions && billSuggestions.length > 0 && (
                                                    <div
                                                        style={{
                                                            position: 'fixed',
                                                            top: dropdownPos.top,
                                                            left: dropdownPos.left,
                                                            width: '300px',
                                                            zIndex: 9999
                                                        }}
                                                        className="bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                                                    >
                                                        {billSuggestions.map((inv) => (
                                                            <button
                                                                key={inv.id}
                                                                onMouseDown={() => handleSearchBill(inv.invoice_no)}
                                                                className="w-full px-4 py-3 text-left hover:bg-primary-50 border-b border-slate-50 last:border-0 transition-colors group"
                                                            >
                                                                <div className="flex justify-between items-start">
                                                                    <div>
                                                                        <p className="text-xs font-black text-primary-600 font-mono tracking-tighter uppercase">{inv.invoice_no}</p>
                                                                        <p className="text-[10px] font-bold text-slate-800 uppercase mt-0.5">{inv.customer_name}</p>
                                                                    </div>
                                                                    <span className="text-[10px] font-black text-slate-400 group-hover:text-primary-500">{new Date(inv.invoice_date).toLocaleDateString()}</span>
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="block text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                                <Hash size={14} className="text-primary-500" /> Return ID
                                            </label>
                                            <input
                                                type="text"
                                                value={returnNo}
                                                readOnly
                                                className="input-field font-black text-primary-700 bg-primary-50/30 border-primary-100 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>

                                    <div className="pb-4">
                                        <DataTable
                                            columns={returnColumns}
                                            data={items}
                                            loading={loading}
                                            emptyMessage="Scan or Enter Bill Number to Load Items"
                                            pagination={{ itemsPerPage: 10 }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Customer & Totals Sidebar */}
                            <div className="space-y-8">
                                {/* Customer Card */}
                                <div className="card !p-0 bg-white/80 backdrop-blur-sm overflow-hidden border border-slate-100">
                                    <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
                                        <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                                            <User size={20} />
                                        </div>
                                        <h2 className="text-lg font-bold text-slate-900 uppercase tracking-widest">Bill Customer</h2>
                                    </div>
                                    <div className="p-8 space-y-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                                    <Hash size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Customer ID</p>
                                                    <p className="text-sm font-black text-slate-900 italic">{customer.id || '---'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                                    <User size={18} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Name</p>
                                                    <p className="text-sm font-black text-slate-900 uppercase truncate">{customer.name || '---'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                                    <Phone size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Mobile</p>
                                                    <p className="text-sm font-black text-slate-900 tracking-tighter">{customer.mobile || '---'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <label className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer group hover:bg-white hover:border-primary-200 transition-all">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${customer.isCredit ? 'bg-primary-600 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100'}`}>
                                                <CreditCard size={18} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Payment Style</p>
                                                <p className="text-sm font-black text-slate-900 tracking-tighter">Adjust as Credit</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={customer.isCredit}
                                                onChange={(e) => setCustomer(prev => ({ ...prev, isCredit: e.target.checked }))}
                                                className="w-5 h-5 rounded-lg border-slate-300 text-primary-600 focus:ring-primary-500/20"
                                            />
                                        </label>
                                    </div>
                                </div>

                                {/* Net Refundable Display */}
                                <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl shadow-slate-900/40 relative overflow-hidden group border border-white/5">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary-500/20 transition-all duration-1000"></div>
                                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl -ml-12 -mb-12 group-hover:bg-rose-500/10 transition-all duration-1000"></div>

                                    <div className="relative z-10 flex flex-col items-center">
                                        <p className="text-[12px] font-black text-primary-300 tracking-[0.4em] mb-4 drop-shadow-sm">Net Refundable Value</p>
                                        <div className="flex items-center gap-4">
                                            <span className="text-xl font-bold text-primary-500 opacity-60 mt-4 leading-none">₹</span>
                                            <h2 className="text-5xl font-black text-white tracking-tighter animate-pulse-subtle">
                                                {calculateTotal()}
                                            </h2>
                                        </div>
                                        <div className="mt-8 px-6 py-2 bg-white/5 rounded-full border border-white/5 backdrop-blur-sm">
                                            <p className="text-[11px] font-bold text-slate-400 tracking-widest">{items.filter(i => i.return_qty > 0).length} Items Selected</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={handleSave}
                                        disabled={loading || items.length === 0}
                                        className="col-span-2 btn btn-primary py-5 text-base flex items-center justify-center gap-3 shadow-2xl active:scale-[0.98] tracking-[0.2em] font-black group"
                                    >
                                        {loading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <><Save size={20} className="group-hover:scale-110 transition-transform" /> Confirm & Return</>
                                        )}
                                    </button>
                                    <button
                                        onClick={handleReset}
                                        className="btn btn-secondary py-4 text-xs font-black tracking-widest flex items-center gap-2 hover:bg-slate-50"
                                    >
                                        <RotateCcw size={16} /> Reset
                                    </button>
                                    <button className="btn btn-secondary py-4 text-xs font-black tracking-widest flex items-center gap-2 hover:bg-slate-50 group">
                                        <Printer size={16} className="group-hover:text-primary-500 transition-colors" /> Receipt
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* History Section */
                    <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                        <DataTable
                            columns={historyColumns}
                            data={returns}
                            loading={loading}
                            searchTerm={historySearchTerm}
                            onSearchChange={setHistorySearchTerm}
                            searchPlaceholder="Search by Return No, Bill No or Customer..."
                            actions={(row) => (
                                <div className="flex items-center gap-2">
                                    <button className="p-2.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all shadow-sm hover:shadow-md bg-white border border-slate-100">
                                        <FileText size={18} />
                                    </button>
                                    <button className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all shadow-sm hover:shadow-md bg-white border border-slate-100">
                                        <Printer size={18} />
                                    </button>
                                </div>
                            )}
                            emptyMessage="No return archives found"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default StockReturn;
