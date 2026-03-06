import React from 'react';

const ReturnReportPrint = ({ data, filters }) => {
    return (
        <div className="print-only hidden print:block bg-white text-black p-4 w-full max-w-[210mm] mx-auto min-h-[297mm] font-serif">
            <style dangerouslySetInnerHTML={{
                __html: `
                @page { size: A4 portrait; margin: 10mm; }
                @media print {
                    body * { visibility: hidden; }
                    .print-only, .print-only * { visibility: visible; }
                    .print-only { position: absolute; left: 0; top: 0; width: 100%; }
                    table { border-collapse: collapse; width: 100%; border: 1px solid black; }
                    th, td { border: 1px solid black; padding: 6px; text-align: left; font-size: 10px; }
                    .header-box { border: 1px solid #ccc; background-color: #f0f0f0; padding: 8px; text-align: center; margin-bottom: 10px; }
                    .report-title { font-weight: bold; margin-bottom: 15px; text-align: center; font-size: 12px; }
                }
            `}} />

            {/* Header Box */}
            <div className="header-box bg-slate-200 border border-slate-400 p-2 text-center mb-4">
                <h1 className="text-sm font-bold text-rose-800 uppercase tracking-wider">D.S. CHITRS TEX</h1>
                <p className="text-[10px] text-rose-800 uppercase">95/9-A, SATHYA NAGAR, KRISHNAN PUDHUR, AMMAPET, SALEM - 636 003</p>
            </div>

            {/* Report Title */}
            <div className="report-title text-center text-[11px] font-bold mb-4 uppercase">
                RETURN REPORT FROM {new Date(filters.fromDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} TO {new Date(filters.toDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </div>

            {/* Data Table */}
            <table className="w-full border-collapse border border-black">
                <thead>
                    <tr className="bg-white">
                        <th className="border border-black p-2 text-[10px] text-rose-900 font-bold uppercase text-center w-12">SNO</th>
                        <th className="border border-black p-2 text-[10px] text-rose-900 font-bold uppercase text-center w-24">RNO</th>
                        <th className="border border-black p-2 text-[10px] text-rose-900 font-bold uppercase text-center w-24">DATE</th>
                        <th className="border border-black p-2 text-[10px] text-rose-900 font-bold uppercase text-center w-24">PCODE</th>
                        <th className="border border-black p-2 text-[10px] text-rose-900 font-bold uppercase text-center w-64">PRODUCT DESCRIPTION</th>
                        <th className="border border-black p-2 text-[10px] text-rose-900 font-bold uppercase text-center w-20">QTY</th>
                        <th className="border border-black p-2 text-[10px] text-rose-900 font-bold uppercase text-center w-24">RETURN AMOUNT</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => (
                        <tr key={index} className="border-b border-black">
                            <td className="border border-black p-2 text-[10px] text-center">{index + 1}</td>
                            <td className="border border-black p-2 text-[10px] text-center font-bold">{row.return_no}</td>
                            <td className="border border-black p-2 text-[10px] text-center">
                                {new Date(row.return_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                            </td>
                            <td className="border border-black p-2 text-[10px] text-center font-mono">{row.product_code}</td>
                            <td className="border border-black p-2 text-[10px] uppercase font-medium">{row.product_name}</td>
                            <td className="border border-black p-2 text-[10px] text-center font-bold">{row.qty}</td>
                            <td className="border border-black p-2 text-[10px] text-right font-bold pr-4">₹{Number(row.return_amount).toFixed(2)}</td>
                        </tr>
                    ))}
                    {data.length === 0 && (
                        <tr>
                            <td colSpan="7" className="text-center py-10 text-slate-400 italic">No return records found for the selected period</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ReturnReportPrint;
