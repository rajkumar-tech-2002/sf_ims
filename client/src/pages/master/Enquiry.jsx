import React, { useState, useEffect } from 'react';
import {
    FileSearch,
    Plus,
    Search,
    Edit2,
    Trash2,
    Save,
    X,
    Calendar,
    User,
    Phone,
    MessageSquare,
    ChevronDown,
    ChevronUp,
    FileText
} from 'lucide-react';
import api from '../../utils/api';
import DataTable from '../../components/DataTable';
import { useToast } from '../../context/ToastContext';
import { usePermissions } from '../../hooks/usePermissions';

const Enquiry = () => {
    const { showToast, confirmToast } = useToast();
    const { canEdit } = usePermissions();
    const moduleId = 'enquiry';
    const [enquiries, setEnquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [showTable, setShowTable] = useState(false);

    const [formData, setFormData] = useState({
        enquiry_date: new Date().toISOString().split('T')[0],
        regarding: '',
        description: '',
        person: '',
        contact: '',
        remarks: ''
    });

    const regardingOptions = [
        "Product Inquiry",
        "Price Quotation",
        "Order Status",
        "Service Request",
        "General Query",
        "Feedback/Complaint",
        "Other"
    ];

    useEffect(() => {
        fetchEnquiries();
    }, []);

    const fetchEnquiries = async () => {
        try {
            setLoading(true);
            const response = await api.get('/enquiries');
            setEnquiries(response.data);
        } catch (error) {
            showToast('error', 'Failed to fetch enquiry records');
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
                await api.put(`/enquiries/${currentId}`, formData);
                showToast('success', 'Enquiry updated successfully');
            } else {
                await api.post('/enquiries', formData);
                showToast('success', 'Enquiry recorded successfully');
            }
            resetForm();
            fetchEnquiries();
        } catch (error) {
            showToast('error', error.response?.data?.message || 'Operation failed');
        }
    };

    const handleEdit = (enquiry) => {
        setFormData({
            enquiry_date: enquiry.enquiry_date.split('T')[0],
            regarding: enquiry.regarding,
            description: enquiry.description,
            person: enquiry.person,
            contact: enquiry.contact,
            remarks: enquiry.remarks
        });
        setCurrentId(enquiry.id);
        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = (id) => {
        confirmToast('Delete this enquiry record permanently?', async () => {
            try {
                await api.delete(`/enquiries/${id}`);
                showToast('success', 'Enquiry deleted successfully');
                fetchEnquiries();
            } catch (error) {
                showToast('error', 'Failed to delete record');
            }
        });
    };

    const resetForm = () => {
        setFormData({
            enquiry_date: new Date().toISOString().split('T')[0],
            regarding: '',
            description: '',
            person: '',
            contact: '',
            remarks: ''
        });
        setIsEditing(false);
        setCurrentId(null);
    };

    const filteredEnquiries = enquiries.filter(enquiry =>
        enquiry.person.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enquiry.regarding.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enquiry.contact.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 lg:p-10 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="section-title text-2xl font-bold text-slate-800">Enquiry Detail</h1>
                        <p className="text-slate-500 text-base font-medium">Record and track customer inquiries and follow-ups.</p>
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
                                <FileSearch size={20} />
                            </div>
                            <h2 className="text-lg font-bold text-slate-800">{isEditing ? 'Edit Enquiry Record' : 'Add New Enquiry'}</h2>
                        </div>
                        {isEditing && (
                            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={20} />
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Date */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Calendar size={12} className="text-primary-500" /> Date
                                </label>
                                <input
                                    type="date"
                                    required
                                    name="enquiry_date"
                                    className="input-field"
                                    value={formData.enquiry_date}
                                    onChange={handleInputChange}
                                />
                            </div>

                            {/* Regarding Dropdown */}
                            <div className="space-y-1.5 lg:col-span-1">
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <MessageSquare size={12} className="text-primary-500" /> Regarding
                                </label>
                                <div className="relative">
                                    <select
                                        required
                                        name="regarding"
                                        className="input-field appearance-none bg-white"
                                        value={formData.regarding}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Select Category</option>
                                        {regardingOptions.map(option => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                        <ChevronDown size={18} />
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-1.5 lg:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <FileText size={12} className="text-primary-500" /> Description
                                </label>
                                <input
                                    type="text"
                                    required
                                    name="description"
                                    className="input-field"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Brief summary of the enquiry"
                                />
                            </div>

                            {/* Person */}
                            <div className="space-y-1.5 lg:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <User size={12} className="text-primary-500" /> Person
                                </label>
                                <input
                                    type="text"
                                    required
                                    name="person"
                                    className="input-field"
                                    value={formData.person}
                                    onChange={handleInputChange}
                                    placeholder="Name of the enquirer"
                                />
                            </div>

                            {/* Contact */}
                            <div className="space-y-1.5 lg:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Phone size={12} className="text-primary-500" /> Contact
                                </label>
                                <input
                                    type="text"
                                    required
                                    name="contact"
                                    maxLength={10}
                                    className="input-field"
                                    value={formData.contact}
                                    onChange={handleInputChange}
                                    placeholder="Phone number"
                                />
                            </div>

                            {/* Remarks */}
                            <div className="space-y-1.5 lg:col-span-4">
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <FileSearch size={12} className="text-primary-500" /> Remarks</label>
                                <textarea
                                    name="remarks"
                                    rows="2"
                                    className="input-field py-3 min-h-[80px]"
                                    value={formData.remarks}
                                    onChange={handleInputChange}
                                    placeholder="Any additional notes or follow-up details..."
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
                                            <Plus size={20} />
                                            {!canEdit(moduleId) ? 'VIEW ONLY MODE' : 'Submit'}
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
                                    key: 'enquiry_date',
                                    label: 'Date',
                                    render: (value) => (
                                        <span className="text-xs font-bold text-slate-700">
                                            {new Date(value).toLocaleDateString('en-IN', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    )
                                },
                                {
                                    key: 'regarding',
                                    label: 'Regarding',
                                    render: (value) => (
                                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] w-fit font-bold uppercase">{value}</span>
                                    )
                                },
                                {
                                    key: 'description',
                                    label: 'Description',
                                    render: (value) => <span className="text-xs text-slate-600 font-medium truncate max-w-[200px] block">{value}</span>
                                },
                                {
                                    key: 'person',
                                    label: 'Person / Contact',
                                    render: (value, row) => (
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900 uppercase">{value}</span>
                                            <span className="text-[10px] font-mono font-bold text-slate-400">{row.contact}</span>
                                        </div>
                                    )
                                },
                                {
                                    key: 'remarks',
                                    label: 'Remarks',
                                    render: (value) => <span className="text-xs text-slate-400 truncate max-w-[150px] block">{value || '---'}</span>
                                }
                            ]}
                            data={filteredEnquiries}
                            loading={loading}
                            searchTerm={searchTerm}
                            onSearchChange={setSearchTerm}
                            searchPlaceholder="Search by name, category or phone..."
                            actions={(enquiry) => (
                                <div className="flex items-center justify-end gap-2">
                                    <button
                                        onClick={() => handleEdit(enquiry)}
                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                        title={canEdit(moduleId) ? "Edit" : "View Details"}
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    {canEdit(moduleId) && (
                                        <button
                                            onClick={() => handleDelete(enquiry.id)}
                                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            )}
                            emptyMessage="No enquiry records found"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Enquiry;
