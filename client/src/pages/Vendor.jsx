import React, { useState, useEffect } from 'react';
import {
    Truck,
    Plus,
    Edit2,
    Trash2,
    Save,
    X,
    Mail,
    Phone,
    MapPin,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import api from '../utils/api';
import DataTable from '../components/DataTable';
import { useToast } from '../context/ToastContext';

const Vendor = () => {
    const { showToast, confirmToast } = useToast();
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [showTable, setShowTable] = useState(false);
    const [formData, setFormData] = useState({
        vendor_name: '',
        vendor_gmail: '',
        vendor_phone: '',
        vendor_address: ''
    });

    useEffect(() => {
        fetchVendors();
    }, []);

    const fetchVendors = async () => {
        try {
            const response = await api.get('/vendors');
            setVendors(response.data);
        } catch (error) {
            showToast('error', 'Failed to fetch vendor records');
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
                await api.put(`/vendors/${currentId}`, formData);
                showToast('success', 'Vendor updated successfully');
            } else {
                await api.post('/vendors', formData);
                showToast('success', 'Vendor added successfully');
            }
            resetForm();
            fetchVendors();
        } catch (error) {
            showToast('error', error.response?.data?.message || 'Operation failed');
        }
    };

    const handleEdit = (vendor) => {
        setFormData({
            vendor_name: vendor.vendor_name,
            vendor_gmail: vendor.vendor_gmail || '',
            vendor_phone: vendor.vendor_phone,
            vendor_address: vendor.vendor_address || ''
        });
        setCurrentId(vendor.id);
        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = (id) => {
        confirmToast('Delete this vendor permanently?', async () => {
            try {
                await api.delete(`/vendors/${id}`);
                showToast('success', 'Vendor deleted successfully');
                fetchVendors();
            } catch (error) {
                showToast('error', 'Failed to delete record');
            }
        });
    };

    const resetForm = () => {
        setFormData({
            vendor_name: '',
            vendor_gmail: '',
            vendor_phone: '',
            vendor_address: ''
        });
        setIsEditing(false);
        setCurrentId(null);
    };

    const filteredVendors = vendors.filter(vendor =>
        vendor.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (vendor.vendor_gmail && vendor.vendor_gmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
        vendor.vendor_phone.includes(searchTerm)
    );

    return (
        <div className="page-container bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="section-title">Vendor Registry</h1>
                        <p className="text-slate-500 text-base mt-2 font-medium">Manage and monitor your project supply partners.</p>
                    </div>
                    <button
                        onClick={() => setShowTable(!showTable)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-sm border
                        ${showTable
                                ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                                : 'bg-white text-primary-600 border-primary-100 hover:border-primary-300 hover:bg-primary-50'}`}
                    >
                        {showTable ? <><ChevronUp size={20} /> Hide Registry</> : <><ChevronDown size={20} /> Show Detail</>}
                    </button>
                </div>

                {/* Entry Form */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-300">
                    <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white">
                                <Truck size={20} />
                            </div>
                            <h2 className="text-lg font-bold text-slate-800">{isEditing ? 'Edit Vendor Record' : 'Add New Vendor'}</h2>
                        </div>
                        {isEditing && (
                            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={20} />
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="space-y-1.5 lg:col-span-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Truck size={12} /> Vendor Name</label>
                                <input
                                    type="text"
                                    required
                                    name="vendor_name"
                                    className="input-field"
                                    value={formData.vendor_name}
                                    onChange={handleInputChange}
                                    placeholder="Enter vendor's full name"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Phone size={12} /> Phone Number</label>
                                <input
                                    type="text"
                                    required
                                    name="vendor_phone"
                                    className="input-field"
                                    maxLength={10}
                                    value={formData.vendor_phone}
                                    onChange={handleInputChange}
                                    placeholder="9876543210"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Mail size={12} /> Email Address</label>
                                <input
                                    type="email"
                                    name="vendor_gmail"
                                    className="input-field"
                                    value={formData.vendor_gmail}
                                    onChange={handleInputChange}
                                    placeholder="vendor@example.com"
                                />
                            </div>
                            <div className="space-y-1.5 lg:col-span-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <MapPin size={12} /> Address</label>
                                <input
                                    type="text"
                                    name="vendor_address"
                                    className="input-field"
                                    value={formData.vendor_address}
                                    onChange={handleInputChange}
                                    placeholder="Enter shop or office address"
                                />
                            </div>
                            <div className="flex items-end">
                                <button type="submit" className="w-full btn btn-primary py-4 text-base flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20">
                                    {isEditing ? <><Save size={20} /> Update Record</> : <><Plus size={20} /> Submit Entry</>}
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
                                    render: (value, row, index) => (
                                        <span className="text-xs font-bold text-slate-600">
                                            {index + 1}
                                        </span>
                                    )
                                },
                                {
                                    key: 'vendor_name',
                                    label: 'Vendor Info',
                                    render: (value, vendor) => (
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors uppercase">{value}</span>
                                            <div className="flex items-center gap-2 mt-1">
                                                <MapPin size={12} className="text-slate-400" />
                                                <span className="text-xs text-slate-400 truncate max-w-[200px]">{vendor.vendor_address || 'No address provided'}</span>
                                            </div>
                                        </div>
                                    )
                                },
                                {
                                    key: 'vendor_phone',
                                    label: 'Contact Details',
                                    render: (phone, vendor) => (
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <Phone size={12} className="text-slate-400" />
                                                <span className="text-xs font-bold text-slate-700">{phone}</span>
                                            </div>
                                            {vendor.vendor_gmail && (
                                                <div className="flex items-center gap-2">
                                                    <Mail size={12} className="text-slate-400" />
                                                    <span className="text-[10px] font-medium text-slate-500">{vendor.vendor_gmail}</span>
                                                </div>
                                            )}
                                        </div>
                                    )
                                }
                            ]}
                            data={filteredVendors}
                            loading={loading}
                            searchTerm={searchTerm}
                            onSearchChange={setSearchTerm}
                            searchPlaceholder="Search by name, phone or email..."
                            actions={(vendor) => (
                                <div className="flex items-center justify-end gap-2">
                                    <button
                                        onClick={() => handleEdit(vendor)}
                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(vendor.id)}
                                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            )}
                            emptyMessage="No vendor records found"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Vendor;
