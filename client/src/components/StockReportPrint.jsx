import React from 'react';

const StockReportPrint = ({ data }) => {
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
                }
            `}} />

            {/* Header Box */}
            <div className="header-box bg-slate-200 border border-slate-400 p-2 text-center mb-4">
                <h1 className="text-sm font-bold text-rose-800 uppercase tracking-wider">D.S. CHITRS TEX</h1>
                <p className="text-[10px] text-rose-800 uppercase">95/9-A, SATHYA NAGAR, KRISHNAN PUDHUR, AMMAPET, SALEM - 636 003</p>
            </div>

            {/* Report Title */}
            <div className="report-title text-center text-[11px] font-bold mb-4">
                PRODUCT STOCK REPORT
            </div>

            {/* Data Table */}
            <table className="w-full border-collapse border border-black">
                <thead>
                    <tr className="bg-white">
                        <th className="border border-black p-1 text-[10px] text-rose-900 font-bold uppercase text-center w-8">SNO</th>
                        <th className="border border-black p-1 text-[10px] text-rose-900 font-bold uppercase text-center w-24">CODE</th>
                        <th className="border border-black p-1 text-[10px] text-rose-900 font-bold uppercase text-left w-48">NAME</th>
                        <th className="border border-black p-1 text-[10px] text-rose-900 font-bold uppercase text-left w-48">DESCRIPTION</th>
                        <th className="border border-black p-1 text-[10px] text-rose-900 font-bold uppercase text-right w-24">Stock</th>
                        <th className="border border-black p-1 text-[10px] text-rose-900 font-bold uppercase text-right w-24">Minimum Limit</th>
                        <th className="border border-black p-1 text-[10px] text-rose-900 font-bold uppercase text-right w-28">Rate Per Unit</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => (
                        <tr key={index} className="border-b border-black">
                            <td className="border border-black p-1 text-[10px] text-center">{index + 1}</td>
                            <td className="border border-black p-1 text-[10px] text-center">{row.product_code || row.hsn_code}</td>
                            <td className="border border-black p-1 text-[10px] uppercase font-medium">{row.product_name}</td>
                            <td className="border border-black p-1 text-[10px] uppercase">{row.detail || 'N/A'}</td>
                            <td className="border border-black p-1 text-[10px] text-right">{(parseFloat(row.qty) || 0).toFixed(2)}</td>
                            <td className="border border-black p-1 text-[10px] text-right">{(parseFloat(row.reorder_level) || 0).toFixed(2)}</td>
                            <td className="border border-black p-1 text-[10px] text-right font-bold">{parseFloat(row.sale_price).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default StockReportPrint;
