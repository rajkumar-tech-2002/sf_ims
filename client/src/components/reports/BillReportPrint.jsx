import React from 'react';

const BillReportPrint = ({ data, filters }) => {
    const totalQty = data.length;
    const totalAmount = data.reduce((sum, row) => sum + parseFloat(row.taxable_amount || 0), 0);
    const totalGst = data.reduce((sum, row) => sum + parseFloat(row.gst_amount || 0), 0);
    const grandTotal = data.reduce((sum, row) => sum + parseFloat(row.grand_total || 0), 0);

    return (
        <div className="print-only hidden print:block bg-white text-black p-4 w-full max-w-[210mm] mx-auto min-h-[297mm] font-serif">
            <style dangerouslySetInnerHTML={{
                __html: `
                @page { size: A4 portrait; margin: 10mm; }
                @media print {
                    body * { visibility: hidden; }
                    .print-only, .print-only * { visibility: visible; }
                    .print-only { position: absolute; left: 0; top: 0; width: 100%; }
                    table { border-collapse: collapse; width: 100%; }
                    th, td { border: 1px solid black; padding: 4px; text-align: left; font-size: 10px; }
                    .header-box { border: 1px solid #ccc; background-color: #f0f0f0; padding: 8px; text-align: center; margin-bottom: 10px; }
                    .report-title { font-weight: bold; margin-bottom: 10px; text-align: center; font-size: 12px; }
                    .footer-totals td { font-weight: bold; border-top: 2px solid black; }
                }
            `}} />

            {/* Header Box */}
            <div className="header-box bg-slate-200 border border-slate-400 p-2 text-center mb-4">
                <h1 className="text-sm font-bold text-rose-800 uppercase tracking-wider">D.S. CHITRS TEX</h1>
                <p className="text-[10px] text-rose-800 uppercase">95/9-A, SATHYA NAGAR, KRISHNAN PUDHUR, AMMAPET, SALEM - 636 003</p>
            </div>

            {/* Report Title */}
            <div className="report-title text-center text-[11px] font-bold mb-4">
                COLLECTION REPORT - Product Name : {filters.productName || 'All'} ({filters.fromDate} To {filters.toDate})
            </div>

            {/* Data Table */}
            <table className="w-full border-collapse border border-black">
                <thead>
                    <tr className="bg-white">
                        <th className="border border-black p-1 text-[10px] text-rose-900 font-bold uppercase text-center w-8">SNO</th>
                        <th className="border border-black p-1 text-[10px] text-rose-900 font-bold uppercase text-center w-20">DATE</th>
                        <th className="border border-black p-1 text-[10px] text-rose-900 font-bold uppercase text-center w-16">BILL NO</th>
                        <th className="border border-black p-1 text-[10px] text-rose-900 font-bold uppercase text-left w-40">CUSTOMER NAME</th>
                        <th className="border border-black p-1 text-[10px] text-rose-900 font-bold uppercase text-left w-32">PRODUCT NAME</th>
                        <th className="border border-black p-1 text-[10px] text-rose-900 font-bold uppercase text-left w-32">DESCRIPTION</th>
                        <th className="border border-black p-1 text-[10px] text-rose-900 font-bold uppercase text-center w-12">GST %</th>
                        <th className="border border-black p-1 text-[10px] text-rose-900 font-bold uppercase text-right w-20">AMOUNT</th>
                        <th className="border border-black p-1 text-[10px] text-rose-900 font-bold uppercase text-right w-20">GST AMOUNT</th>
                        <th className="border border-black p-1 text-[10px] text-rose-900 font-bold uppercase text-right w-20">GRAND TOTAL</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => (
                        <tr key={index} className="border-b border-black">
                            <td className="border border-black p-1 text-[10px] text-center">{index + 1}</td>
                            <td className="border border-black p-1 text-[10px] text-center">{new Date(row.invoice_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                            <td className="border border-black p-1 text-[10px] text-center">{row.invoice_no}</td>
                            <td className="border border-black p-1 text-[10px] uppercase font-medium">{row.customer_name}</td>
                            <td className="border border-black p-1 text-[10px] uppercase">{row.product_name}</td>
                            <td className="border border-black p-1 text-[10px] uppercase">{row.description}</td>
                            <td className="border border-black p-1 text-[10px] text-center">{row.gst_percent}</td>
                            <td className="border border-black p-1 text-[10px] text-right">{parseFloat(row.taxable_amount).toFixed(2)}</td>
                            <td className="border border-black p-1 text-[10px] text-right">{parseFloat(row.gst_amount).toFixed(2)}</td>
                            <td className="border border-black p-1 text-[10px] text-right font-bold">{parseFloat(row.grand_total).toFixed(2)}</td>
                        </tr>
                    ))}
                    {/* Totals Row */}
                    <tr className="bg-white font-bold">
                        <td colSpan="6" className="border border-black p-1 text-[10px] text-right uppercase"></td>
                        <td className="border border-black p-1 text-[10px] text-center">{totalQty}</td>
                        <td className="border border-black p-1 text-[10px] text-right">{totalAmount.toFixed(2)}</td>
                        <td className="border border-black p-1 text-[10px] text-right">{totalGst.toFixed(2)}</td>
                        <td className="border border-black p-1 text-[10px] text-right">{grandTotal.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default BillReportPrint;
