import React from 'react';

const QuotationPrint = ({ quotationDate, quotationNo, customer, items, totals, gstMode }) => {
    return (
        <div className="print-only hidden print:block bg-white text-slate-900 p-8 w-full max-w-[210mm] mx-auto min-h-[297mm]">
            <style dangerouslySetInnerHTML={{
                __html: `
                @page { size: A4 portrait; margin: 15mm; }
                @media print {
                    body * { visibility: hidden; }
                    .print-only, .print-only * { visibility: visible; }
                    .print-only { position: absolute; left: 0; top: 0; width: 100%; }
                }
            `}} />

            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900 mb-1">STOCKWISE</h1>
                    <p className="text-xs font-bold text-slate-500 tracking-widest uppercase">Inventory Management System</p>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-bold uppercase tracking-widest text-slate-900 mb-2">QUOTATION</h2>
                    <div className="space-y-1">
                        <p className="text-xs text-slate-500 font-bold uppercase">No: <span className="text-slate-900">{quotationNo}</span></p>
                        <p className="text-xs text-slate-500 font-bold uppercase">Date: <span className="text-slate-900">{new Date(quotationDate).toLocaleDateString()}</span></p>
                    </div>
                </div>
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-2 gap-12 mb-10">
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Quotation For</p>
                    <h3 className="text-lg font-black text-slate-900 uppercase mb-2">{customer.name}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-[250px]">{customer.address || 'No address provided'}</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Contact Info</p>
                    <p className="text-xs text-slate-900 font-bold mb-1">Mobile: <span className="font-normal text-slate-600">{customer.mobile || 'N/A'}</span></p>
                    {customer.contact && <p className="text-xs text-slate-900 font-bold mb-1">Landline: <span className="font-normal text-slate-600">{customer.contact}</span></p>}
                    <p className="text-xs text-slate-900 font-bold mb-1">GSTIN: <span className="font-normal text-slate-600 uppercase">{customer.gstNo || 'N/A'}</span></p>
                    <p className="text-xs text-slate-900 font-bold mb-1">Location: <span className="font-normal text-slate-600 uppercase">{customer.state || 'N/A'} ({customer.stateCode || '--'})</span></p>
                    <p className="text-xs text-slate-900 font-bold mt-1 tracking-tighter">GST Mode: <span className="text-blue-600">{gstMode}</span></p>
                </div>
            </div>

            {/* Items Table */}
            <table className="w-full text-left border-collapse mb-10">
                <thead>
                    <tr className="border-y-2 border-slate-900">
                        <th className="py-3 px-2 text-[10px] font-black uppercase tracking-widest text-slate-900 w-12 text-center">S.No</th>
                        <th className="py-3 px-2 text-[10px] font-black uppercase tracking-widest text-slate-900">Product Details</th>
                        <th className="py-3 px-2 text-[10px] font-black uppercase tracking-widest text-slate-900 text-center">HSN</th>
                        <th className="py-3 px-2 text-[10px] font-black uppercase tracking-widest text-slate-900 text-right">Price</th>
                        <th className="py-3 px-2 text-[10px] font-black uppercase tracking-widest text-slate-900 text-center">Qty</th>
                        <th className="py-3 px-2 text-[10px] font-black uppercase tracking-widest text-slate-900 text-center">GST</th>
                        <th className="py-3 px-2 text-[10px] font-black uppercase tracking-widest text-slate-900 text-right">Total</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {items.map((item, index) => (
                        <tr key={item.id}>
                            <td className="py-4 px-2 text-xs font-bold text-slate-600 text-center">{index + 1}</td>
                            <td className="py-4 px-2">
                                <p className="text-xs font-black text-slate-900 uppercase mb-0.5">{item.productName}</p>
                                <p className="text-[10px] text-slate-400 leading-tight">{item.description}</p>
                            </td>
                            <td className="py-4 px-2 text-xs text-slate-600 text-center font-mono">{item.hsnCode || '-'}</td>
                            <td className="py-4 px-2 text-xs text-slate-900 text-right">₹{parseFloat(item.price).toLocaleString()}</td>
                            <td className="py-4 px-2 text-xs text-slate-900 text-center font-bold">
                                {item.qty} <span className="text-[9px] text-slate-400 ml-0.5 uppercase tracking-tighter">{item.scale || 'UNIT'}</span>
                            </td>
                            <td className="py-4 px-2 text-xs text-slate-900 text-center font-bold">{item.gstPercent}%</td>
                            <td className="py-4 px-2 text-xs font-black text-slate-900 text-right">₹{parseFloat(item.totalAmount).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Footer Summary */}
            <div className="flex justify-end pt-6 border-t border-slate-200">
                <div className="w-64 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-500 uppercase tracking-widest">Subtotal</span>
                        <span className="font-black text-slate-900">₹{totals.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-500 uppercase tracking-widest">Tax Total</span>
                        <span className="font-black text-slate-900">₹{totals.gstTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-500 uppercase tracking-widest">Round Off</span>
                        <span className="font-black text-slate-900">{totals.roundOff >= 0 ? '+' : ''}{totals.roundOff}</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t-2 border-slate-900">
                        <span className="text-sm font-black uppercase tracking-widest text-slate-900">Grand Total</span>
                        <span className="text-xl font-black text-slate-900 tracking-tighter">₹{totals.grandTotal.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Terms & Conditions */}
            <div className="mt-20">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Terms & Conditions</p>
                <div className="space-y-1.5">
                    <p className="text-[10px] text-slate-500 leading-relaxed">• This quotation is valid for 15 days from the date of issue.</p>
                    <p className="text-[10px] text-slate-500 leading-relaxed">• Prices are subject to change based on market conditions.</p>
                    <p className="text-[10px] text-slate-500 leading-relaxed">• Goods once sold will not be taken back or exchanged.</p>
                    <p className="text-[10px] text-slate-500 leading-relaxed">• All disputes are subject to local jurisdiction.</p>
                </div>
            </div>

            <div className="mt-24 pt-12 border-t border-slate-100 flex justify-between items-end">
                <div className="text-center">
                    <div className="w-32 h-px bg-slate-900 mb-2 mx-auto"></div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Customer Signature</p>
                </div>
                <div className="text-center">
                    <div className="w-32 h-px bg-slate-900 mb-2 mx-auto"></div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Authorized Signatory</p>
                </div>
            </div>
        </div>
    );
};

export default QuotationPrint;
