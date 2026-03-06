import React from 'react';

const RawMaterialStockReportPrint = ({ data }) => {
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
                RAW MATERIAL PRODUCT STOCK REPORT
            </div>

            {/* Data Table */}
            <table className="w-full border-collapse border border-black">
                <thead>
                    <tr className="bg-white text-[10px] text-rose-900 font-bold uppercase">
                        <th className="text-center w-12">SNO</th>
                        <th className="text-center w-24">CODE</th>
                        <th className="text-center w-48">NAME</th>
                        <th className="text-center w-64">DESCRIPTION</th>
                        <th className="text-center w-20">Stock</th>
                        <th className="text-center w-24">Minimum Limit</th>
                        <th className="text-center w-24">Rate Per Unit</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => (
                        <tr key={index} className="border-b border-black">
                            <td className="text-center">{index + 1}</td>
                            <td className="text-center font-mono">{row.product_code || row.hsn_code || '---'}</td>
                            <td className="uppercase font-bold">{row.product_name}</td>
                            <td className="uppercase italic text-slate-600">{row.detail || '---'}</td>
                            <td className="text-center font-bold">{row.qty} {row.scale}</td>
                            <td className="text-center font-bold text-rose-700">{row.reorder_level}</td>
                            <td className="text-right font-bold pr-4">₹{Number(row.price_rate).toFixed(2)}</td>
                        </tr>
                    ))}
                    {data.length === 0 && (
                        <tr>
                            <td colSpan="7" className="text-center py-10 text-slate-400 italic">No raw material records found</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default RawMaterialStockReportPrint;
