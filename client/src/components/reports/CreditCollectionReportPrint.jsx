import React from 'react';

const CreditCollectionReportPrint = ({ selectedCustomer, reportData, totals }) => {
    if (!selectedCustomer) return null;

    return (
        <div className="print-only hidden print:block bg-white text-black p-4 w-full max-w-[210mm] mx-auto min-h-[297mm] font-serif">
            <style dangerouslySetInnerHTML={{
                __html: `
                @page { size: A4 portrait; margin: 10mm; }
                @media print {
                    body * { visibility: hidden; }
                    .print-only, .print-only * { visibility: visible; }
                    .print-only { position: absolute; left: 0; top: 0; width: 100%; }
                    table { border-collapse: collapse; width: 100%; margin-top: 10px; }
                    th, td { border: 1px solid black; padding: 6px 4px; text-align: left; font-size: 10px; }
                    .header-box { border: 1px solid #ccc; background-color: #f0f0f0; padding: 8px; text-align: center; margin-bottom: 20px; }
                    .report-title { font-weight: bold; margin-bottom: 20px; text-align: center; font-size: 12px; text-decoration: underline; }
                    .footer-box { margin-top: 30px; display: flex; justify-content: flex-end; }
                    .footer-table { width: 250px; border-collapse: collapse; }
                    .footer-table td { border: 1px solid black; padding: 4px 8px; font-weight: bold; }
                }
            `}} />

            {/* Header Box */}
            <div className="header-box bg-slate-200 border border-slate-400 p-2 text-center mb-4">
                <h1 className="text-sm font-black text-rose-800 uppercase tracking-wider">D.S. CHITRS TEX</h1>
                <p className="text-[10px] text-rose-800 uppercase font-bold">95/9-A, SATHYA NAGAR, KRISHNAN PUDHUR, AMMAPET, SALEM - 636 003</p>
            </div>

            {/* Report Title */}
            <div className="report-title text-center text-[11px] font-bold mb-4 uppercase tracking-[0.1em]">
                CUSTOMER TRANSACTION REPORT
            </div>

            {/* Customer Info */}
            <div className="mb-4 text-xs">
                <p><strong>Customer:</strong> <span className="uppercase">{selectedCustomer.customer_name}</span></p>
                <p><strong>Credit ID:</strong> {selectedCustomer.latest_credit_id || '-'}</p>
                {selectedCustomer.customer_mobile && <p><strong>Mobile:</strong> {selectedCustomer.customer_mobile}</p>}
            </div>

            {/* Data Table */}
            <table className="w-full border-collapse border border-black">
                <thead>
                    <tr className="bg-slate-100">
                        <th className="text-center w-10">SNo</th>
                        <th className="text-center w-24">DATE</th>
                        <th className="text-center w-28">Credit ID</th>
                        <th>Description</th>
                        <th className="text-right w-24">Bill Amount</th>
                        <th className="text-right w-24">PAID</th>
                    </tr>
                </thead>
                <tbody>
                    {reportData.map((row, index) => (
                        <tr key={index}>
                            <td className="text-center">{index + 1}</td>
                            <td className="text-center">{new Date(row.date).toLocaleDateString()}</td>
                            <td className="text-center font-mono font-bold text-[9px]">{row.credit_id}</td>
                            <td className="uppercase">{row.description}</td>
                            <td className="text-right">{parseFloat(row.bill_amount).toFixed(2)}</td>
                            <td className="text-right">{parseFloat(row.paid_amount).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Totals Section */}
            <div className="footer-box">
                <table className="footer-table">
                    <tbody>
                        <tr>
                            <td className="text-[10px] uppercase">Total Bill</td>
                            <td className="text-right text-[10px]">₹{totals.totalBill.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        </tr>
                        <tr>
                            <td className="text-[10px] uppercase">Total Paid</td>
                            <td className="text-right text-[10px]">₹{totals.totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        </tr>
                        <tr className="bg-slate-100">
                            <td className="text-[10px] uppercase font-black">Net Balance</td>
                            <td className="text-right text-[10px] font-black">₹{totals.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CreditCollectionReportPrint;
