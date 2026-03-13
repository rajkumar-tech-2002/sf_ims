import React, { useState, useEffect } from 'react';
import {
    Users,
    UserPlus,
    Search,
    Edit2,
    Trash2,
    Save,
    X,
    ChevronDown,
    ChevronUp,
    MapPin,
    Phone,
    Smartphone,
    Hash,
    Briefcase,
    Printer
} from 'lucide-react';
import api from '../../utils/api';
import DataTable from '../../components/DataTable';
import { useToast } from '../../context/ToastContext';
import { usePermissions } from '../../hooks/usePermissions';
import CustomerReportPrint from '../../components/reports/CustomerReportPrint';

const Customers = () => {
    const { showToast, confirmToast } = useToast();
    const { canEdit } = usePermissions();
    const moduleId = 'customers';
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [showTable, setShowTable] = useState(false);

    const [formData, setFormData] = useState({
        customer_id: '',
        customer_name: '',
        customer_address: '',
        customer_contact: '',
        customer_mobile: '',
        gst_no: '',
        state: '',
        state_code: ''
    });

    useEffect(() => {
        fetchCustomers();
    }, []);

    const generateNextId = (data) => {
        if (!data || data.length === 0) return 'CUST-001';

        const ids = data.map(c => {
            const match = c.customer_id?.match(/CUST-(\d+)/);
            return match ? parseInt(match[1]) : 0;
        });

        const maxId = Math.max(...ids, 0);
        return `CUST-${String(maxId + 1).padStart(3, '0')}`;
    };

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/customers');
            setCustomers(response.data);
            if (!isEditing) {
                const nextId = generateNextId(response.data);
                setFormData(prev => ({ ...prev, customer_id: nextId }));
            }
        } catch (error) {
            showToast('error', 'Failed to fetch customer records');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await api.put(`/customers/${currentId}`, formData);
                showToast('success', 'Customer updated successfully');
            } else {
                await api.post('/customers', formData);
                showToast('success', 'Customer added successfully');
            }
            resetForm();
            fetchCustomers();
        } catch (error) {
            showToast('error', error.response?.data?.message || 'Operation failed');
        }
    };

    const handleEdit = (customer) => {
        setFormData({
            customer_id: customer.customer_id,
            customer_name: customer.customer_name,
            customer_address: customer.customer_address,
            customer_contact: customer.customer_contact,
            customer_mobile: customer.customer_mobile,
            gst_no: customer.gst_no,
            state: customer.state,
            state_code: customer.state_code
        });
        setCurrentId(customer.id);
        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handlePrint = () => {
        if (filteredCustomers.length === 0) {
            showToast('warning', 'No customer records to print');
            return;
        }
        window.print();
    };

    const handleDelete = (id) => {
        confirmToast('Delete this customer permanently?', async () => {
            try {
                await api.delete(`/customers/${id}`);
                showToast('success', 'Customer deleted successfully');
                fetchCustomers();
            } catch (error) {
                showToast('error', 'Failed to delete record');
            }
        });
    };

    const resetForm = () => {
        setFormData({
            customer_id: generateNextId(customers),
            customer_name: '',
            customer_address: '',
            customer_contact: '',
            customer_mobile: '',
            gst_no: '',
            state: '',
            state_code: ''
        });
        setIsEditing(false);
        setCurrentId(null);
    };

    const filteredCustomers = customers.filter(customer =>
        customer.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.customer_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.customer_contact.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="page-container bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-10">
                {/* Header Area */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-1">
                        <h1 className="section-title text-2xl font-bold text-slate-800">Customer Registry</h1>
                        <p className="text-slate-500 text-base font-medium">Manage your customer relationships and contact details with absolute precision.</p>
                    </div>
                    <button
                        onClick={() => setShowTable(!showTable)}
                        className={`flex items-center gap-2 px-8 py-3.5 rounded-[1.25rem] font-black transition-all duration-300 shadow-sm border uppercase text-xs tracking-widest
                        ${showTable
                                ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                                : 'bg-white text-primary-600 border-primary-200 hover:border-primary-400 hover:bg-primary-50 hover:shadow-md'}`}
                    >
                        {showTable ? <><ChevronUp size={18} /> Hide Registry</> : <><ChevronDown size={18} /> Show Detail</>}
                    </button>
                    {showTable && (
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-8 py-3.5 rounded-[1.25rem] font-black transition-all duration-300 shadow-sm border uppercase text-xs tracking-widest bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-700 hover:shadow-md"
                        >
                            <Printer size={18} /> Print Report
                        </button>
                    )}
                </div>

                {/* Entry Form */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-300">
                    <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white">
                                <UserPlus size={20} />
                            </div>
                            <h2 className="text-lg font-bold text-slate-800">{isEditing ? 'Edit Customer Record' : 'Add New Customer'}</h2>
                        </div>
                        {isEditing && (
                            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={20} />
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Customer ID */}
                            <div className="space-y-3">
                                <label className="block text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                    <Hash size={14} className="text-primary-500" /> Reference ID
                                </label>
                                <input
                                    type="text"
                                    required
                                    name="customer_id"
                                    className="input-field"
                                    placeholder="CUST-001"
                                    value={formData.customer_id}
                                    onChange={handleInputChange}
                                />
                            </div>

                            {/* Customer Name */}
                            <div className="space-y-3 lg:col-span-2">
                                <label className="block text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                    <Users size={14} className="text-primary-500" /> Client Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    name="customer_name"
                                    className="input-field"
                                    placeholder="Full Name / Company Name"
                                    value={formData.customer_name}
                                    onChange={handleInputChange}
                                />
                            </div>

                            {/* GST NO */}
                            <div className="space-y-3">
                                <label className="block text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                    <Briefcase size={14} className="text-primary-500" /> GST Number
                                </label>
                                <input
                                    type="text"
                                    name="gst_no"
                                    className="input-field uppercase"
                                    placeholder="GSTIN Number"
                                    value={formData.gst_no}
                                    onChange={handleInputChange}
                                />
                            </div>

                            {/* Address */}
                            <div className="space-y-3 lg:col-span-4">
                                <label className="block text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                    <MapPin size={14} className="text-primary-500" /> Address
                                </label>
                                <textarea
                                    name="customer_address"
                                    rows="2"
                                    className="input-field py-3 min-h-[80px]"
                                    value={formData.customer_address}
                                    onChange={handleInputChange}
                                    placeholder="Full shipping/billing address..."
                                />
                            </div>

                            {/* Contact Person */}
                            <div className="space-y-3 lg:col-span-2">
                                <label className="block text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                    <Phone size={14} className="text-primary-500" /> Primary Contact
                                </label>
                                <input
                                    type="text"
                                    name="customer_contact"
                                    className="input-field"
                                    maxLength={10}
                                    placeholder="Person to communicate with"
                                    value={formData.customer_contact}
                                    onChange={handleInputChange}
                                />
                            </div>

                            {/* Mobile */}
                            <div className="space-y-3 lg:col-span-2">
                                <label className="block text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                    <Smartphone size={14} className="text-primary-500" /> Optional Number
                                </label>
                                <input
                                    type="text"
                                    required
                                    name="customer_mobile"
                                    className="input-field"
                                    maxLength={10}
                                    placeholder="Primary phone number"
                                    value={formData.customer_mobile}
                                    onChange={handleInputChange}
                                />
                            </div>

                            {/* State */}
                            <div className="space-y-3 lg:col-span-3">
                                <label className="block text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                    <MapPin size={14} className="text-primary-500" /> State Name
                                </label>
                                <input
                                    type="text"
                                    name="state"
                                    className="input-field"
                                    placeholder="State Name"
                                    value={formData.state}
                                    onChange={handleInputChange}
                                />
                            </div>

                            {/* State Code */}
                            <div className="space-y-3">
                                <label className="block text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                    <Hash size={14} className="text-primary-500" /> State Code
                                </label>
                                <input
                                    type="text"
                                    name="state_code"
                                    className="input-field"
                                    placeholder="Code"
                                    value={formData.state_code}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="lg:col-span-4 flex justify-end pt-4">
                                <button
                                    type="submit"
                                    disabled={!canEdit(moduleId)}
                                    className={`w-full md:w-1/3 btn btn-primary py-4 text-base flex items-center justify-center gap-2 shadow-lg rounded-2xl transition-all duration-300 ${!canEdit(moduleId) ? 'opacity-50 grayscale cursor-not-allowed shadow-none' : 'shadow-primary-500/20 bg-primary-600 text-white'}`}
                                >
                                    {isEditing ? (
                                        <>
                                            <Save size={20} />
                                            {!canEdit(moduleId) ? 'VIEW ONLY MODE' : 'Update Record'}
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus size={20} />
                                            {!canEdit(moduleId) ? 'VIEW ONLY MODE' : 'Save Customer'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Table Section */}
                {showTable && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                        <DataTable
                            columns={[
                                {
                                    key: 'serial',
                                    label: 'S.No',
                                    render: (_, __, index) => (
                                        <span className="text-xs font-bold text-slate-600">
                                            {index + 1}
                                        </span>
                                    )
                                },
                                {
                                    key: 'customer_id',
                                    label: 'ID',
                                    render: (value) => <span className="text-xs font-bold text-slate-400">{value}</span>
                                },
                                {
                                    key: 'customer_name',
                                    label: 'Customer Name',
                                    render: (value, row) => (
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900 uppercase truncate max-w-[150px]">{value}</span>
                                            <span className="text-[10px] font-bold text-primary-500">GST: {row.gst_no || 'NA'}</span>
                                        </div>
                                    )
                                },
                                {
                                    key: 'customer_contact',
                                    label: 'Contact Info',
                                    render: (value, row) => (
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                                                <Smartphone size={10} className="text-primary-500" /> {value}
                                            </div>
                                            {row.customer_mobile && (
                                                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                                    <Users size={10} strokeWidth={3} className="text-primary-500" /> {row.customer_mobile}
                                                </div>
                                            )}
                                        </div>
                                    )
                                },
                                {
                                    key: 'state',
                                    label: 'Location',
                                    render: (value, row) => (
                                        <div className="flex flex-col">
                                            <span className="text-xs text-slate-700 font-bold uppercase">{value || '---'}</span>
                                            <span className="text-[10px] text-slate-400 font-mono">Code: {row.state_code || '---'}</span>
                                        </div>
                                    )
                                },
                                {
                                    key: 'customer_address',
                                    label: 'Address',
                                    render: (value) => <span className="text-xs text-slate-400 truncate max-w-[200px] block">{value || '---'}</span>
                                }
                            ]}
                            data={filteredCustomers}
                            loading={loading}
                            searchTerm={searchTerm}
                            onSearchChange={setSearchTerm}
                            searchPlaceholder="Search by name, ID or phone..."
                            actions={(customer) => (
                                <div className="flex items-center justify-end gap-2">
                                    <button
                                        onClick={() => handleEdit(customer)}
                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                        title={canEdit(moduleId) ? "Edit" : "View Details"}
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    {canEdit(moduleId) && (
                                        <button
                                            onClick={() => handleDelete(customer.id)}
                                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            )}
                            emptyMessage="No customer records found"
                        />
                    </div>
                )}
            </div>

            {/* System Generated Print Matrix */}
            <CustomerReportPrint data={filteredCustomers} />
        </div>
    );
};

export default Customers;
